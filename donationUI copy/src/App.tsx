import { useEffect, useState, useCallback } from 'react'
import { WalletConnect } from './components/WalletConnect'
import { Stats } from './components/Stats'
import { DonateForm } from './components/DonateForm'
import { DonationHistory } from './components/DonationHistory'
import { fetchStats, fetchDonations } from './lib/contract'
import type { WalletState, ContractStats, DonationRecord } from './lib/types'
import './App.css'

const DEFAULT_WALLET: WalletState = {
  connected: false,
  publicKey: null,
  network: null,
}

function App() {
  const [wallet, setWallet] = useState<WalletState>(DEFAULT_WALLET)
  const [stats, setStats] = useState<ContractStats | null>(null)
  const [donations, setDonations] = useState<DonationRecord[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setStatsLoading(true)
    setHistoryLoading(true)
    setLoadError(null)
    try {
      const [s, d] = await Promise.all([fetchStats(), fetchDonations()])
      setStats(s)
      setDonations(d)
    } catch (err) {
      console.error('Failed to load contract data:', err)
      setLoadError(err instanceof Error ? err.message : 'Failed to load contract data')
    } finally {
      setStatsLoading(false)
      setHistoryLoading(false)
    }
  }, [])

  // Load contract data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">💫</span>
            <h1>openLedger Donation</h1>
          </div>
          <WalletConnect
            wallet={wallet}
            onConnect={setWallet}
            onDisconnect={() => setWallet(DEFAULT_WALLET)}
          />
        </div>
      </header>

      <main className="app-main">
        <section className="hero-section">
          <p className="hero-tagline">
            Support open-source development — donations go directly on-chain via
            a Stellar Soroban smart contract.
          </p>
        </section>

        {loadError && (
          <div className="error-banner" role="alert">
            <strong>Could not reach contract:</strong> {loadError}
            <button className="btn btn-outline retry-btn" onClick={loadData}>
              Retry
            </button>
          </div>
        )}

        <Stats stats={stats} loading={statsLoading} />

        <div className="content-grid">
          <DonateForm wallet={wallet} onSuccess={loadData} />
          <DonationHistory donations={donations} loading={historyLoading} />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Powered by{' '}
          <a href="https://stellar.org" target="_blank" rel="noreferrer">
            Stellar
          </a>{' '}
          &amp;{' '}
          <a href="https://soroban.stellar.org" target="_blank" rel="noreferrer">
            Soroban
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
