import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS = {
  draft:      { color: 'text-ink-400',  bg: 'bg-ink-700/50',      dot: 'bg-ink-500' },
  sending:    { color: 'text-amber-400', bg: 'bg-amber-500/10',    dot: 'bg-amber-400 animate-pulse' },
  completed:  { color: 'text-volt',      bg: 'bg-volt/10',         dot: 'bg-volt' },
  failed:     { color: 'text-ember',     bg: 'bg-ember/10',        dot: 'bg-ember' },
}

const container = { animate: { transition: { staggerChildren: 0.06 } } }
const item = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/campaign')
      .then(res => setCampaigns(res.data.campaigns))
      .catch(() => toast.error('Failed to load campaigns'))
      .finally(() => setLoading(false))
  }, [])

  const deleteCampaign = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this campaign?')) return
    try {
      await api.delete(`/campaign/${id}`)
      toast.success('Campaign deleted')
      setCampaigns(c => c.filter(x => x._id !== id))
    } catch { toast.error('Delete failed') }
  }

  const stats = [
    { label: 'Campaigns', value: campaigns.length, accent: 'text-ink-100' },
    { label: 'Emails Sent', value: campaigns.reduce((s, c) => s + (c.sentCount || 0), 0).toLocaleString(), accent: 'text-volt' },
    { label: 'Failed', value: campaigns.reduce((s, c) => s + (c.failedCount || 0), 0), accent: 'text-ember' },
    { label: 'Completed', value: campaigns.filter(c => c.status === 'completed').length, accent: 'text-aqua' },
  ]

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-10"
      >
        <div>
          <h1 className="font-display font-black text-3xl text-ink-100 mb-1">Campaigns</h1>
          <p className="text-ink-400 text-sm">Manage and track all your email campaigns</p>
        </div>
        <Link to="/campaign/new">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(198,241,53,0.3)' }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <span className="text-lg leading-none">+</span> New Campaign
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container} initial="initial" animate="animate"
        className="grid grid-cols-4 gap-4 mb-10"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={item} className="card p-5">
            <p className="text-ink-500 text-xs font-display font-semibold uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`font-display font-black text-3xl ${s.accent}`}>{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-ink-500">
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-2xl mr-3">⟳</motion.span>
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="card border-dashed p-16 text-center"
        >
          <div className="text-5xl mb-4">✉️</div>
          <h3 className="font-display font-bold text-lg text-ink-200 mb-2">No campaigns yet</h3>
          <p className="text-ink-500 text-sm mb-6">Create your first campaign to start sending bulk emails</p>
          <Link to="/campaign/new">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary">
              Create Campaign
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="initial" animate="animate" className="space-y-3">
          <AnimatePresence>
            {campaigns.map((c) => {
              const pct = c.totalRecipients > 0 ? (c.sentCount / c.totalRecipients) * 100 : 0
              const s = STATUS[c.status] || STATUS.draft
              return (
                <motion.div
                  key={c._id} variants={item} layout
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ borderColor: 'rgba(198,241,53,0.3)', x: 2 }}
                  onClick={() => navigate(`/campaign/${c._id}`)}
                  className="card px-5 py-4 cursor-pointer flex items-center gap-5 transition-colors duration-200"
                >
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm text-ink-100 truncate mb-0.5">{c.name}</div>
                    <div className="text-ink-500 text-xs truncate">{c.subject}</div>
                  </div>

                  {/* Progress */}
                  <div className="w-36 flex-shrink-0">
                    <div className="flex justify-between text-xs text-ink-500 mb-1.5">
                      <span><span className="text-volt font-semibold">{c.sentCount}</span> / {c.totalRecipients}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-volt"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={clsx('badge flex-shrink-0', s.bg, s.color)}>
                    {c.status}
                  </span>

                  {/* Date */}
                  <span className="text-ink-600 text-xs flex-shrink-0 w-20 text-right">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>

                  {/* Delete */}
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={(e) => deleteCampaign(c._id, e)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-ink-700 text-ink-500 hover:border-ember/50 hover:text-ember text-xs transition-all duration-200 bg-transparent cursor-pointer"
                  >
                    Delete
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}