import { useState } from 'react'
import type { WalletState } from '../lib/types'
import { checkFreighterInstalled, connectWallet } from '../lib/stellar'

interface Props {
  wallet: WalletState
  onConnect: (state: WalletState) => void
  onDisconnect: () => void
}

export function WalletConnect({ wallet, onConnect, onDisconnect }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    setError(null)
    setLoading(true)
    try {
      const installed = await checkFreighterInstalled()
      if (!installed) {
        setError('Freighter wallet extension not found. Please install it from freighter.app.')
        return
      }
      const state = await connectWallet()
      onConnect(state)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  function truncate(key: string) {
    return `${key.slice(0, 6)}...${key.slice(-4)}`
  }

  if (wallet.connected && wallet.publicKey) {
    return (
      <div className="wallet-bar">
        <span className="wallet-address" title={wallet.publicKey}>
          <span className="dot connected" aria-hidden="true" />
          {truncate(wallet.publicKey)}
          <span className="network-badge">{wallet.network}</span>
        </span>
        <button
          className="btn btn-outline"
          onClick={onDisconnect}
          aria-label="Disconnect wallet"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="wallet-bar">
      {error && (
        <p className="error-inline" role="alert">
          {error}
        </p>
      )}
      <button
        className="btn btn-primary"
        onClick={handleConnect}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Connecting…' : 'Connect Freighter'}
      </button>
    </div>
  )
}
