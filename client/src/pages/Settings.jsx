import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

const providers = [
  { name: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false },
  { name: 'Outlook', host: 'smtp.office365.com', port: 587, secure: false },
  { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, secure: false },
  { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587, secure: false },
  { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 465, secure: true },
]

export default function Settings() {
  const [smtp, setSmtp] = useState({ host: '', port: 587, secure: false, user: '', pass: '', fromName: '', fromEmail: '' })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    api.get('/auth/me').then(res => {
      if (res.data.user?.smtpConfig?.host) setSmtp(res.data.user.smtpConfig)
    })
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/smtp', smtp)
      toast.success('SMTP configuration saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const test = async () => {
    if (!smtp.host || !smtp.user || !smtp.pass) return toast.error('Fill in SMTP details first')
    setTesting(true)
    setTestResult(null)
    try {
      const res = await api.post('/email/test-smtp', smtp)
      setTestResult({ ok: true, msg: res.data.message })
      toast.success(res.data.message)
    } catch (err) {
      setTestResult({ ok: false, msg: err.response?.data?.message || 'Connection failed' })
      toast.error(err.response?.data?.message || 'Connection failed')
    } finally { setTesting(false) }
  }

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display font-black text-3xl text-ink-100 mb-1">Settings</h1>
        <p className="text-ink-400 text-sm">Configure your SMTP server to start sending</p>
      </motion.div>

      {/* Quick presets */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.05 }}
        className="card p-6 mb-5"
      >
        <h3 className="font-display font-bold text-ink-200 text-sm mb-4">⚡ Quick Setup</h3>
        <div className="flex flex-wrap gap-2">
          {providers.map(p => (
            <motion.button
              key={p.name}
              whileHover={{ scale: 1.04, borderColor: 'rgba(198,241,53,0.4)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSmtp(s => ({ ...s, host: p.host, port: p.port, secure: p.secure }))}
              className="px-4 py-2 rounded-xl bg-ink-800 border border-ink-600 text-ink-300 hover:text-volt text-xs font-display font-semibold transition-colors duration-200 cursor-pointer"
            >
              {p.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* SMTP Form */}
      <motion.form
        variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}
        onSubmit={save}
        className="card p-7"
      >
        <h3 className="font-display font-bold text-ink-200 text-sm mb-6">SMTP Configuration</h3>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="col-span-2">
            <label className="block text-ink-500 text-xs font-semibold uppercase tracking-widest mb-2">SMTP Host</label>
            <input value={smtp.host} onChange={e => setSmtp({...smtp, host: e.target.value})}
              placeholder="smtp.gmail.com" className="input-base" />
          </div>
          <div>
            <label className="block text-ink-500 text-xs font-semibold uppercase tracking-widest mb-2">Port</label>
            <input type="number" value={smtp.port} onChange={e => setSmtp({...smtp, port: +e.target.value})}
              placeholder="587" className="input-base" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-ink-500 text-xs font-semibold uppercase tracking-widest mb-2">Username</label>
            <input value={smtp.user} onChange={e => setSmtp({...smtp, user: e.target.value})}
              placeholder="your@email.com" className="input-base" />
          </div>
          <div>
            <label className="block text-ink-500 text-xs font-semibold uppercase tracking-widest mb-2">Password / App Password</label>
            <input type="password" value={smtp.pass} onChange={e => setSmtp({...smtp, pass: e.target.value})}
              placeholder="••••••••••••" className="input-base" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-ink-500 text-xs font-semibold uppercase tracking-widest mb-2">From Name</label>
            <input value={smtp.fromName} onChange={e => setSmtp({...smtp, fromName: e.target.value})}
              placeholder="Your Name" className="input-base" />
          </div>
          <div>
            <label className="block text-ink-500 text-xs font-semibold uppercase tracking-widest mb-2">From Email</label>
            <input type="email" value={smtp.fromEmail} onChange={e => setSmtp({...smtp, fromEmail: e.target.value})}
              placeholder="you@domain.com" className="input-base" />
          </div>
        </div>

        {/* Secure toggle */}
        <div className="flex items-center gap-4 mb-7 p-4 bg-ink-800/50 rounded-xl border border-ink-700">
          <button
            type="button"
            onClick={() => setSmtp(s => ({ ...s, secure: !s.secure }))}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 border-none cursor-pointer ${smtp.secure ? 'bg-volt' : 'bg-ink-600'}`}
          >
            <motion.div
              animate={{ x: smtp.secure ? 20 : 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
            />
          </button>
          <div>
            <span className="text-ink-200 text-sm font-semibold">{smtp.secure ? 'SSL/TLS Enabled' : 'STARTTLS (port 587)'}</span>
            <p className="text-ink-500 text-xs mt-0.5">Use SSL for port 465, STARTTLS for port 587</p>
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl mb-5 text-sm font-semibold flex items-center gap-2 ${
              testResult.ok ? 'bg-volt/10 border border-volt/25 text-volt' : 'bg-ember/10 border border-ember/25 text-ember'
            }`}
          >
            <span>{testResult.ok ? '✓' : '✗'}</span>
            {testResult.msg}
          </motion.div>
        )}

        <div className="flex gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={test} disabled={testing}
            className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {testing ? (
              <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⟳</motion.span> Testing...</>
            ) : '⚡ Test Connection'}
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(198,241,53,0.25)' }}
            whileTap={{ scale: 0.97 }}
            disabled={saving}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </motion.button>
        </div>
      </motion.form>

      {/* Gmail tip */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="mt-5 p-5 rounded-2xl border border-volt/20 bg-volt/5"
      >
        <h4 className="font-display font-bold text-volt text-sm mb-1.5">💡 Gmail Users</h4>
        <p className="text-ink-400 text-xs leading-relaxed">
          Use an <strong className="text-ink-200">App Password</strong> — not your regular Gmail password.
          Go to <strong className="text-ink-200">Google Account → Security → 2-Step Verification → App Passwords</strong> to generate one.
        </p>
      </motion.div>
    </div>
  )
}