import type { DonationRecord } from '../lib/types'
import { stroopsToXlm } from '../lib/contract'

interface Props {
  donations: DonationRecord[]
  loading: boolean
}

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function formatDate(ts: bigint) {
  // Soroban ledger timestamps are Unix seconds
  return new Date(Number(ts) * 1000).toLocaleString()
}

export function DonationHistory({ donations, loading }: Props) {
  return (
    <section className="card history-card" aria-labelledby="history-heading">
      <h2 id="history-heading">Donation History</h2>

      {loading && (
        <p className="loading-msg" aria-live="polite">Loading donations…</p>
      )}

      {!loading && donations.length === 0 && (
        <p className="empty-msg">No donations yet. Be the first!</p>
      )}

      {!loading && donations.length > 0 && (
        <div className="table-wrapper" role="region" aria-label="Donation history table" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th scope="col">Donor</th>
                <th scope="col" className="amount-col">Amount</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {[...donations].reverse().map((d, i) => (
                <tr key={i}>
                  <td>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${d.donor}`}
                      target="_blank"
                      rel="noreferrer"
                      title={d.donor}
                    >
                      {truncate(d.donor)}
                    </a>
                  </td>
                  <td className="amount-col">
                    <strong>{stroopsToXlm(d.amount)} XLM</strong>
                  </td>
                  <td className="date-col">{formatDate(d.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
