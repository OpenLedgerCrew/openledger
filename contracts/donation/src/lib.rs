#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    token, Address, Env, Vec,
};

// ─── Data types ──────────────────────────────────────────────────────────────

/// A single donation record stored on-chain.
#[contracttype]
#[derive(Clone, Debug)]
pub struct DonationRecord {
    pub donor: Address,
    pub amount: i128,
    pub timestamp: u64,
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct DonationContract;

#[contractimpl]
impl DonationContract {
    /// Called once after deployment.
    /// `owner`  – address that can withdraw funds.
    /// `token`  – Stellar asset contract address (e.g. native XLM wrapped token).
    pub fn initialize(env: Env, owner: Address, token: Address) {
        if env.storage().instance().has(&symbol_short!("OWNER")) {
            panic!("already initialised");
        }

        env.storage()
            .instance()
            .set(&symbol_short!("OWNER"), &owner);
        env.storage()
            .instance()
            .set(&symbol_short!("TOKEN"), &token);
        env.storage()
            .instance()
            .set(&symbol_short!("TOTAL"), &0_i128);
    }

    /// Donate `amount` of the configured token to the contract.
    /// The caller must have approved the contract to spend `amount` first,
    /// or use `transfer` directly (the contract will pull from the donor).
    pub fn donate(env: Env, donor: Address, amount: i128) {
        donor.require_auth();

        if amount <= 0 {
            panic!("amount must be positive");
        }

        let token_address: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("TOKEN"))
            .expect("not initialised");

        // Pull tokens from donor into the contract
        token::Client::new(&env, &token_address).transfer(
            &donor,
            &env.current_contract_address(),
            &amount,
        );

        // Update running total
        let mut total: i128 = env
            .storage()
            .instance()
            .get(&symbol_short!("TOTAL"))
            .unwrap_or(0);
        total += amount;
        env.storage()
            .instance()
            .set(&symbol_short!("TOTAL"), &total);

        // Append donation record
        let mut records: Vec<DonationRecord> = env
            .storage()
            .instance()
            .get(&symbol_short!("DONORS"))
            .unwrap_or_else(|| Vec::new(&env));

        records.push_back(DonationRecord {
            donor: donor.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
        });
        env.storage()
            .instance()
            .set(&symbol_short!("DONORS"), &records);

        // Emit event: topic = (donate, donor), data = amount
        env.events()
            .publish((symbol_short!("donate"), donor), amount);
    }

    /// Withdraw all held tokens to the owner's address. Owner only.
    pub fn withdraw(env: Env) {
        let owner: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("OWNER"))
            .expect("not initialised");

        owner.require_auth();

        let token_address: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("TOKEN"))
            .expect("not initialised");

        let token_client = token::Client::new(&env, &token_address);
        let balance = token_client.balance(&env.current_contract_address());

        if balance > 0 {
            token_client.transfer(&env.current_contract_address(), &owner, &balance);
        }

        env.events()
            .publish((symbol_short!("withdraw"), owner), balance);
    }

    // ─── Read-only queries ────────────────────────────────────────────────

    /// Total amount donated so far (in stroops / smallest token unit).
    pub fn total_donated(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&symbol_short!("TOTAL"))
            .unwrap_or(0)
    }

    /// All donation records in insertion order.
    pub fn get_donations(env: Env) -> Vec<DonationRecord> {
        env.storage()
            .instance()
            .get(&symbol_short!("DONORS"))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Current token balance held by this contract.
    pub fn get_balance(env: Env) -> i128 {
        let token_address: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("TOKEN"))
            .expect("not initialised");

        token::Client::new(&env, &token_address).balance(&env.current_contract_address())
    }

    /// Return the configured owner address.
    pub fn get_owner(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&symbol_short!("OWNER"))
            .expect("not initialised")
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{
        testutils::Address as _,
        token::{Client as TokenClient, StellarAssetClient},
        Address, Env,
    };

    /// Set up a fresh environment with a mock token, a funded donor, and
    /// an initialised donation contract.
    fn setup() -> (Env, Address, Address, Address, DonationContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();

        // Register a mock Stellar asset contract
        let token_admin = Address::generate(&env);
        let token_address = env.register_stellar_asset_contract_v2(token_admin.clone()).address();

        // Mint tokens to the donor
        let donor = Address::generate(&env);
        StellarAssetClient::new(&env, &token_address).mint(&donor, &10_000_0000000);

        // Deploy and initialise the donation contract
        let owner = Address::generate(&env);
        let contract_id = env.register(DonationContract, ());
        let client = DonationContractClient::new(&env, &contract_id);
        client.initialize(&owner, &token_address);

        (env, owner, donor, token_address, client)
    }

    #[test]
    fn test_donate_and_query() {
        let (_env, _owner, donor, _token, client) = setup();

        client.donate(&donor, &1_000_0000000);

        assert_eq!(client.total_donated(), 1_000_0000000);
        let records = client.get_donations();
        assert_eq!(records.len(), 1);
        assert_eq!(records.get(0).unwrap().amount, 1_000_0000000);
    }

    #[test]
    fn test_multiple_donations() {
        let (_env, _owner, donor, _token, client) = setup();

        client.donate(&donor, &500_0000000);
        client.donate(&donor, &300_0000000);

        assert_eq!(client.total_donated(), 800_0000000);
        assert_eq!(client.get_donations().len(), 2);
    }

    #[test]
    fn test_withdraw() {
        let (_env, owner, donor, _token, client) = setup();

        client.donate(&donor, &1_000_0000000);
        assert_eq!(client.get_balance(), 1_000_0000000);

        client.withdraw();

        assert_eq!(client.get_balance(), 0);
    }

    #[test]
    #[should_panic(expected = "amount must be positive")]
    fn test_zero_donation_rejected() {
        let (_env, _owner, donor, _token, client) = setup();
        client.donate(&donor, &0);
    }

    #[test]
    #[should_panic(expected = "already initialised")]
    fn test_double_init_rejected() {
        let (env, owner, _donor, token, client) = setup();
        let new_owner = Address::generate(&env);
        client.initialize(&new_owner, &token);
    }
}
