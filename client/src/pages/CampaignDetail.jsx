import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const RECIPIENT_STATUS = {
  pending: { text: 'text-ink-400',  bg: 'bg-ink-700/50',   dot: 'bg-ink-500' },
  sent:    { text: 'text-volt',      bg: 'bg-volt/10',       dot: 'bg-volt' },
  failed:  { text: 'text-ember',     bg: 'bg-ember/10',      dot: 'bg-ember' },
}

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('all')
  const pollRef = useRef(null)

  const fetch = async () => {
    try {
      const res = await api.get(`/campaign/${id}`)
      setCampaign(res.data.campaign)
      return res.data.campaign
    } catch { toast.error('Failed to load') }
  }

  useEffect(() => { fetch(); return () => clearInterval(pollRef.current) }, [id])

  useEffect(() => {
    if (!campaign) return
    if (campaign.status === 'sending') {
      pollRef.current = setInterval(async () => {
        const updated = await fetch()
        if (updated?.status !== 'sending') clearInterval(pollRef.current)
      }, 2500)
    } else clearInterval(pollRef.current)
    return () => clearInterval(pollRef.current)
  }, [campaign?.status])

  const startSend = async () => {
    setSending(true)
    try {
      await api.post(`/campaign/${id}/send`)
      toast.success('Campaign sending started!')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start')
    } finally { setSending(false) }
  }

  if (!campaign) return (
    <div className="flex items-center justify-center h-64 text-ink-500">
      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-2xl mr-3">⟳</motion.span>
      Loading campaign...
    </div>
  )

  const pct = campaign.totalRecipients > 0 ? (campaign.sentCount / campaign.totalRecipients) * 100 : 0
  const filtered = campaign.recipients.filter(r => filter === 'all' || r.status === filter)

  const filterCounts = {
    all: campaign.recipients.length,
    pending: campaign.recipients.filter(r => r.status === 'pending').length,
    sent: campaign.sentCount,
    failed: campaign.failedCount,
  }

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-ink-500 text-xs font-semibold hover:text-ink-300 transition-colors mb-3 flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
          >
            ← Back to Dashboard
          </button>
          <h1 className="font-display font-black text-2xl text-ink-100 mb-1">{campaign.name}</h1>
          <p className="text-ink-500 text-sm">{campaign.subject}</p>
        </div>

        {/* Action button */}
        <div>
          {campaign.status === 'draft' && (
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(56,240,192,0.35)' }}
              whileTap={{ scale: 0.96 }}
              onClick={startSend} disabled={sending}
              className="px-7 py-3.5 bg-aqua text-ink-950 font-display font-black rounded-xl border-none cursor-pointer disabled:opacity-50 flex items-center gap-2 text-sm transition-all"
            >
              {sending ? (
                <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⟳</motion.span> Starting...</>
              ) : '🚀 Send Campaign'}
            </motion.button>
          )}
          {campaign.status === 'sending' && (
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="px-5 py-3 rounded-xl border border-amber-500/30 bg-amber-500/8 text-amber-400 font-display font-bold text-sm flex items-center gap-2"
            >
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>⟳</motion.span>
              Sending live...
            </motion.div>
          )}
          {campaign.status === 'completed' && (
            <div className="px-5 py-3 rounded-xl border border-volt/30 bg-volt/8 text-volt font-display font-bold text-sm">
              ✓ Completed
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: campaign.totalRecipients, color: 'text-ink-100' },
          { label: 'Sent', value: campaign.sentCount, color: 'text-volt' },
          { label: 'Failed', value: campaign.failedCount, color: 'text-ember' },
          { label: 'Pending', value: campaign.totalRecipients - campaign.sentCount - campaign.failedCount, color: 'text-ink-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <p className="text-ink-500 text-xs font-display font-semibold uppercase tracking-widest mb-2">{s.label}</p>
            <motion.p
              key={s.value}
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className={`font-display font-black text-3xl ${s.color}`}
            >{s.value}</motion.p>
          </motion.div>
        ))}
      </div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="card p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="font-display font-bold text-ink-200 text-sm">Send Progress</span>
          <motion.span
            key={pct}
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="font-display font-black text-volt text-xl"
          >{Math.round(pct)}%</motion.span>
        </div>
        <div className="h-2.5 bg-ink-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #c6f135, #38f0c0)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        {campaign.failedCount > 0 && (
          <div className="mt-2 flex gap-4">
            <span className="text-volt text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-volt inline-block" />
              Sent: {campaign.sentCount}
            </span>
            <span className="text-ember text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ember inline-block" />
              Failed: {campaign.failedCount}
            </span>
          </div>
        )}
      </motion.div>

      {/* Recipients table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display font-bold text-ink-200 text-sm">Recipients</h3>
          <div className="flex gap-1.5">
            {['all', 'pending', 'sent', 'failed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-display font-semibold transition-all duration-200 border-none cursor-pointer capitalize',
                  filter === f ? 'bg-volt text-ink-950' : 'bg-ink-800 text-ink-400 hover:bg-ink-700'
                )}
              >
                {f} ({filterCounts[f]})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-ink-900">
              <tr className="border-b border-ink-700">
                {['Email', 'Name', 'Status', 'Sent At', 'Error'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-ink-500 text-xs font-display font-semibold uppercase tracking-widest font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-ink-600">No recipients in this filter</td></tr>
                ) : filtered.map((r, i) => {
                  const s = RECIPIENT_STATUS[r.status]
                  return (
                    <motion.tr
                      key={r.email}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-ink-800/60 hover:bg-ink-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink-200 text-xs font-mono">{r.email}</td>
                      <td className="px-4 py-3 text-ink-400 text-xs">{r.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('badge', s.bg, s.text)}>
                          <span className={clsx('w-1.5 h-1.5 rounded-full', s.dot)} />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-500 text-xs">
                        {r.sentAt ? new Date(r.sentAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-ember text-xs max-w-[180px] truncate">
                        {r.error || '—'}
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}