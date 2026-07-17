import {
  isConnected,
  getAddress,
  getNetwork,
  signTransaction,
  requestAccess,
} from "@stellar/freighter-api";
import type { WalletState } from "./types";

/** Check if Freighter extension is installed and accessible */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const result = await isConnected();
    return result.isConnected;
  } catch {
    return false;
  }
}

/** Request wallet access and return the connected state. Only ever called from an explicit click. */
export async function connectWallet(): Promise<WalletState> {
  const accessResult = await requestAccess();
  if (accessResult.error) {
    throw new Error(`Wallet access denied: ${accessResult.error}`);
  }

  const addressResult = await getAddress();
  if (addressResult.error || !addressResult.address) {
    throw new Error(`Could not get address: ${addressResult.error}`);
  }

  const networkResult = await getNetwork();
  if (networkResult.error) {
    throw new Error(`Could not get network: ${networkResult.error}`);
  }

  const networkName = networkResult.network?.toLowerCase() ?? "testnet";

  return {
    connected: true,
    publicKey: addressResult.address,
    network: networkName.includes("mainnet") ? "mainnet" : "testnet",
  };
}

/** Sign an XDR-encoded transaction envelope with Freighter */
export async function signTxWithFreighter(
  xdr: string,
  networkPassphrase: string
): Promise<string> {
  const result = await signTransaction(xdr, { networkPassphrase });
  if (result.error || !result.signedTxXdr) {
    throw new Error(`Signing failed: ${result.error}`);
  }
  return result.signedTxXdr;
}
