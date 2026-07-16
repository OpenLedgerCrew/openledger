import type { ContractStats } from '../lib/types'
import { stroopsToXlm } from '../lib/contract'

interface Props {
  stats: ContractStats | null
  loading: boolean
}

export function Stats({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="stats-grid" aria-busy="true" aria-label="Loading stats">
        {[0, 1, 2].map((i) => (
          <div key={i} className="stat-card skeleton" aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">Total Donated</span>
        <span className="stat-value">{stroopsToXlm(stats.totalDonated)} XLM</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Contract Balance</span>
        <span className="stat-value">{stroopsToXlm(stats.balance)} XLM</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Total Donations</span>
        <span className="stat-value">{stats.donationCount}</span>
      </div>
    </div>
  )
}
