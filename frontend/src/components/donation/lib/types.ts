// Matches the DonationRecord contracttype in the Rust contract
export interface DonationRecord {
  donor: string;
  amount: bigint;
  timestamp: bigint;
}

export interface ContractStats {
  totalDonated: bigint;
  balance: bigint;
  donationCount: number;
}

export type Network = "testnet" | "mainnet";

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  network: Network | null;
}
