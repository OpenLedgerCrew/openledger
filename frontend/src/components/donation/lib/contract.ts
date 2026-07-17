import {
  Account,
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  scValToNative,
  nativeToScVal,
  Address,
  rpc,
} from "@stellar/stellar-sdk";
import type { ContractStats, DonationRecord } from "./types";
import { signTxWithFreighter } from "./stellar";

// ─── Config ──────────────────────────────────────────────────────────────────
// Defaults point at the already-deployed testnet contract — this is a public address, not a
// secret, so the donate flow works with zero setup. Override via frontend/.env for a different
// deployment (e.g. mainnet, once one exists).
export const CONTRACT_ID =
  import.meta.env.VITE_CONTRACT_ID ?? "CBPT2EDYIGFG4VOQ7622WCCVDW7DLSCGPOE4WEFM4FTLPAP4AH7SEXAL";
export const RPC_URL = import.meta.env.VITE_RPC_URL ?? "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE ?? Networks.TESTNET;

// Stellar uses 7 decimal places: 1 XLM = 10_000_000 stroops
export const STROOPS_PER_XLM = 10_000_000n;

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * Number(STROOPS_PER_XLM)));
}

export function stroopsToXlm(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_XLM;
  const frac = stroops % STROOPS_PER_XLM;
  if (frac === 0n) return whole.toString();
  return `${whole}.${frac.toString().padStart(7, "0").replace(/0+$/, "")}`;
}

// ─── RPC helpers ─────────────────────────────────────────────────────────────

function getServer(): rpc.Server {
  return new rpc.Server(RPC_URL, { allowHttp: false });
}

// ─── Read-only simulation ─────────────────────────────────────────────────────

// A well-known funded testnet account used purely as a source for simulation.
// It never needs to match the actual caller; the RPC only uses it for fee/seq.
const SIM_ACCOUNT_ID = "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR";
const SIM_SEQUENCE = "1";

async function simulateContractCall(method: string, args: xdr.ScVal[] = []): Promise<xdr.ScVal> {
  const server = getServer();
  const contract = new Contract(CONTRACT_ID);

  // Use a synthetic Account — the RPC accepts any valid G-address for simulation
  const sourceAccount = new Account(SIM_ACCOUNT_ID, SIM_SEQUENCE);

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(result)) {
    const err = result as rpc.Api.SimulateTransactionErrorResponse;
    throw new Error(`Simulation error calling ${method}: ${err.error}`);
  }

  const ok = result as rpc.Api.SimulateTransactionSuccessResponse;
  if (!ok.result?.retval) throw new Error(`No return value from ${method}`);
  return ok.result.retval;
}

// ─── Read queries ─────────────────────────────────────────────────────────────

export async function fetchStats(): Promise<ContractStats> {
  const [totalVal, balanceVal, donationsVal] = await Promise.all([
    simulateContractCall("total_donated"),
    simulateContractCall("get_balance"),
    simulateContractCall("get_donations"),
  ]);

  // scValToNative returns JS bigint for i128
  const totalDonated = BigInt(scValToNative(totalVal) as bigint);
  const balance = BigInt(scValToNative(balanceVal) as bigint);
  const donations = scValToNative(donationsVal) as unknown[];

  return { totalDonated, balance, donationCount: donations.length };
}

export async function fetchDonations(): Promise<DonationRecord[]> {
  const val = await simulateContractCall("get_donations");
  const raw = scValToNative(val) as Array<{
    donor: string;
    amount: bigint | number;
    timestamp: bigint | number;
  }>;

  return raw.map((r) => ({
    donor: r.donor,
    amount: BigInt(r.amount),
    timestamp: BigInt(r.timestamp),
  }));
}

// ─── Write: donate ────────────────────────────────────────────────────────────

/**
 * Build, simulate, sign (Freighter), and submit a donate() transaction.
 * Polls until the transaction is confirmed or fails.
 */
export async function submitDonation(
  donorPublicKey: string,
  amountStroops: bigint
): Promise<string> {
  const server = getServer();
  const contract = new Contract(CONTRACT_ID);

  // Fetch the live account so we have the real sequence number
  const sourceAccount = await server.getAccount(donorPublicKey);

  const donorScVal = new Address(donorPublicKey).toScVal();
  const amountScVal = nativeToScVal(amountStroops, { type: "i128" });

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("donate", donorScVal, amountScVal))
    .setTimeout(30)
    .build();

  // Simulate to get Soroban footprint + resource fees
  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) {
    const err = simResult as rpc.Api.SimulateTransactionErrorResponse;
    throw new Error(`Simulation failed: ${err.error}`);
  }

  // Assemble (injects SorobanData + fees into the transaction)
  const preparedTx = rpc.assembleTransaction(tx, simResult).build();

  // Sign with Freighter
  const signedXdr = await signTxWithFreighter(preparedTx.toXDR(), NETWORK_PASSPHRASE);

  // Submit
  const submitResult = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE)
  );

  if (submitResult.status === "ERROR") {
    // errorResult is XDR-derived and can carry bigint fields (fees/resource costs) — a plain
    // JSON.stringify throws on those and masks the real error behind a serialization crash.
    const detail = JSON.stringify(submitResult.errorResult, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
    throw new Error(`Submission failed: ${detail}`);
  }

  // ── Poll for confirmation ──────────────────────────────────────────────────
  // sendTransaction returns PENDING/DUPLICATE/TRY_AGAIN_LATER immediately.
  // We then poll getTransaction until it resolves to SUCCESS or FAILED.
  const { GetTransactionStatus } = rpc.Api;

  const hash = submitResult.hash;

  for (let attempt = 0; attempt < 24; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const poll = await server.getTransaction(hash);

    if (poll.status === GetTransactionStatus.SUCCESS) {
      return hash;
    }

    if (poll.status === GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain. Check the contract state and try again.");
    }

    // GetTransactionStatus.NOT_FOUND means the ledger hasn't closed yet — keep polling
  }

  throw new Error("Transaction timed out (60s). It may still confirm — check the explorer.");
}
