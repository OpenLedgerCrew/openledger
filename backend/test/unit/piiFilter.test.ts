import { describe, expect, it } from 'vitest';
import { filterPayment } from '../../src/services/piiFilter';

// Doc sections 4.2, 4.3, 4.4 — the PII filter at the read-model boundary (D-3).

const WALLET_ADDRESS = 'G' + 'A'.repeat(55);

// A raw payment record containing every field from section 4.1: "name, phone number, national
// ID verification note, date of birth ... the receiver's Stellar wallet address ... proxy
// identity and delivery geotag" — plus email and ID number from the section 4.3 table.
const rawRecord = {
  reference_id: 'REF-001',
  amount: '100.00',
  asset: 'USDC',
  status: 'SUCCESS',
  created_at: '2026-07-01T09:00:00Z',
  settled_at: '2026-07-01T09:05:00Z',
  tx_hash: 'ab'.repeat(32),
  delivery_confirmed_at: '2026-07-02T10:00:00Z',
  name: 'Amina Hassan',
  phone: '+254700000001',
  email: 'amina@example.com',
  id_number: '12345678',
  national_id_verification_note: 'verified against national ID',
  date_of_birth: '1990-04-12',
  wallet_address: WALLET_ADDRESS,
  proxy_identity: 'PROXY-7-JOSEPH',
  delivery_geotag: { lat: 3.1189, lon: 35.5973 },
};

describe('piiFilter (doc section 4)', () => {
  // Section 4.2 — the filtered output contains ONLY the fields in the 4.2 table: opaque
  // reference ID, amount and asset, payment status, created and settled timestamps, Stellar
  // transaction hash, delivery confirmation timestamp. (Aggregate metrics are computed
  // separately, section 5.4.)
  it('4.2 — output contains only the fields permitted by the section 4.2 table', () => {
    const out = filterPayment(rawRecord);
    const allowed = [
      'amount',
      'asset',
      'created_at',
      'delivery_confirmed_at',
      'reference_id',
      'settled_at',
      'status',
      'tx_hash',
    ];
    expect(Object.keys(out).sort()).toEqual(allowed);
  });

  // Section 4.3 — hard prohibitions (O-4: zero PII anywhere in the portal). Each field must be
  // absent as a key: not null, not empty-string, absent.
  const prohibited = [
    'name',
    'phone',
    'email',
    'id_number',
    'national_id_verification_note',
    'date_of_birth',
    'wallet_address',
    'proxy_identity',
    'delivery_geotag',
  ];
  for (const field of prohibited) {
    it(`4.3 — "${field}" is absent as a key in the filtered output`, () => {
      const out = filterPayment(rawRecord);
      expect(out).not.toHaveProperty(field);
    });
  }

  // Section 4.4 — "Never render the receiver's wallet address. Not in the UI, not in the API
  // response, not in the PDF, not in the page source." Defensive: the address is stripped even
  // when present under an unexpected key name.
  it('4.4 — receiver wallet address is stripped even under unexpected key names', () => {
    const smuggled = {
      ...rawRecord,
      recipient_addr: WALLET_ADDRESS,
      wallet: WALLET_ADDRESS,
      meta: { destination: WALLET_ADDRESS },
    };
    const out = filterPayment(smuggled);
    expect(JSON.stringify(out)).not.toContain(WALLET_ADDRESS);
  });
});
