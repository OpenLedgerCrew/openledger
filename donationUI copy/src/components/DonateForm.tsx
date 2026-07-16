import { useState } from 'react'
import { xlmToStroops, submitDonation } from '../lib/contract'
import type { WalletState } from '../lib/types'

interface Props {
  wallet: WalletState
  onSuccess: () => void
}

export function DonateForm({ wallet, onSuccess }: Props) {
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setTxHash(null)

    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg('Please enter a valid positive amount.')
      return
    }

    if (!wallet.publicKey) {
      setErrorMsg('Please connect your wallet first.')
      return
    }

    setStatus('submitting')
    try {
      const stroops = xlmToStroops(parsed)
      const hash = await submitDonation(wallet.publicKey, stroops)
      setTxHash(hash)
      setStatus('success')
      setAmount('')
      onSuccess()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed')
      setStatus('error')
    }
  }

  const isSubmitting = status === 'submitting'

  return (
    <section className="card donate-card" aria-labelledby="donate-heading">
      <h2 id="donate-heading">Make a Donation</h2>

      {!wallet.connected && (
        <p className="info-msg">Connect your Freighter wallet above to donate.</p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="amount">Amount (XLM)</label>
          <div className="input-row">
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0.0000001"
              step="any"
              placeholder="e.g. 10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!wallet.connected || isSubmitting}
              aria-describedby={errorMsg ? 'donate-error' : undefined}
              required
            />
            <span className="input-suffix" aria-hidden="true">XLM</span>
          </div>
        </div>

        {errorMsg && (
          <p id="donate-error" className="error-msg" role="alert">
            {errorMsg}
          </p>
        )}

        {status === 'success' && txHash && (
          <p className="success-msg" role="status">
            Donation confirmed!{' '}
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="tx-link"
            >
              View on explorer
            </a>
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={!wallet.connected || isSubmitting || !amount}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Submitting…' : 'Donate'}
        </button>
      </form>
    </section>
  )
}
