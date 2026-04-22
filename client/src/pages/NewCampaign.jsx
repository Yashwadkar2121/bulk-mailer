import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STEPS = ['Compose', 'Recipients', 'Review']

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir < 0 ? 40 : -40 }),
}

export default function NewCampaign() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [form, setForm] = useState({ name: '', subject: '', body: '' })
  const [recipients, setRecipients] = useState([])
  const [emailInput, setEmailInput] = useState('')
  const [csvLoading, setCsvLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  const goTo = (n) => { setDir(n > step ? 1 : -1); setStep(n) }
  const next = () => goTo(step + 1)
  const back = () => goTo(step - 1)

  const parseEmailInput = () => {
    const lines = emailInput.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean)
    const parsed = lines.map(line => {
      const match = line.match(/^(.+)<(.+@.+)>$/) || line.match(/^(.+)\s+(.+@.+)$/)
      if (match) return { name: match[1].trim(), email: match[2].trim() }
      if (line.includes('@')) return { name: '', email: line }
      return null
    }).filter(Boolean)
    const newOnes = parsed.filter(p => !recipients.find(r => r.email === p.email))
    setRecipients(prev => [...prev, ...newOnes])
    setEmailInput('')
    if (newOnes.length) toast.success(`Added ${newOnes.length} recipient(s)`)
    else toast('All emails already added')
  }

  const handleCSV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCsvLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.post('/email/parse-csv', fd)
      const newOnes = res.data.recipients.filter(p => !recipients.find(r => r.email === p.email))
      setRecipients(prev => [...prev, ...newOnes])
      toast.success(`Imported ${newOnes.length} recipients from CSV`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'CSV import failed')
    } finally {
      setCsvLoading(false)
      fileRef.current.value = ''
    }
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      const res = await api.post('/campaign', { ...form, recipients })
      toast.success('Campaign created!')
      navigate(`/campaign/${res.data.campaign._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-black text-3xl text-ink-100 mb-1">New Campaign</h1>
        <p className="text-ink-400 text-sm">Compose and send to your recipients in 3 steps</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <motion.button
              onClick={() => i < step && goTo(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-bold transition-all duration-200 cursor-pointer border-none
                ${i === step ? 'bg-volt text-ink-950' : i < step ? 'bg-ink-800 text-ink-300 hover:bg-ink-700 cursor-pointer' : 'bg-transparent text-ink-600 cursor-default'}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black
                ${i === step ? 'bg-ink-950/20' : i < step ? 'bg-volt text-ink-950' : 'bg-ink-700 text-ink-500'}`}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </motion.button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-1 ${i < step ? 'bg-volt/40' : 'bg-ink-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {/* STEP 0: Compose */}
          {step === 0 && (
            <div className="card p-7 space-y-5">
              <h3 className="font-display font-bold text-ink-200">Email Content</h3>
              <div>
                <label className="block text-ink-500 text-xs font-semibold uppercase tracking-widest mb-2">Campaign Name (internal)</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. November Newsletter" className="input-base" />
              </div>
              <div>
                <label className="block text-ink-500 text-xs font-semibold uppercase tracking-widest mb-2">
                  Subject Line
                  <span className="text-volt/60 normal-case tracking-normal ml-2 font-normal">— use {'{{name}}'} to personalize</span>
                </label>
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                  placeholder="Hey {{name}}, here's something special!" className="input-base" />
              </div>
              <div>
                <label className="block text-ink-500 text-xs font-semibold uppercase tracking-widest mb-2">
                  Email Body
                  <span className="text-volt/60 normal-case tracking-normal ml-2 font-normal">— HTML supported, {'{{name}}'} & {'{{email}}'} tags work</span>
                </label>
                <textarea
                  value={form.body} onChange={e => setForm({...form, body: e.target.value})}
                  rows={10} className="input-base resize-y leading-relaxed"
                  placeholder={`<h2>Hi {{name}},</h2>\n<p>We have exciting news for you...</p>\n<p>Best,<br>Your Team</p>`}
                />
              </div>
              <div className="flex justify-end pt-2">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(198,241,53,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!form.name || !form.subject || !form.body) return toast.error('Please fill in all fields')
                    next()
                  }}
                  className="btn-primary"
                >
                  Next: Add Recipients →
                </motion.button>
              </div>
            </div>
          )}

          {/* STEP 1: Recipients */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="card p-7 space-y-5">
                <h3 className="font-display font-bold text-ink-200">Add Recipients</h3>

                {/* CSV Drop zone */}
                <motion.div
                  whileHover={{ borderColor: 'rgba(198,241,53,0.5)', backgroundColor: 'rgba(198,241,53,0.03)' }}
                  onClick={() => fileRef.current.click()}
                  className="border-2 border-dashed border-ink-600 rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
                >
                  <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
                  <div className="text-3xl mb-3">{csvLoading ? '⏳' : '📄'}</div>
                  <div className="font-display font-bold text-ink-200 mb-1">{csvLoading ? 'Importing...' : 'Upload CSV File'}</div>
                  <div className="text-ink-500 text-xs">CSV with email, name columns • Max 5MB</div>
                </motion.div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-ink-700" />
                  <span className="text-ink-600 text-xs">or paste emails</span>
                  <div className="flex-1 h-px bg-ink-700" />
                </div>

                <textarea
                  value={emailInput} onChange={e => setEmailInput(e.target.value)}
                  rows={5} className="input-base resize-y leading-relaxed"
                  placeholder={"john@example.com\njane@company.com\nBob Smith <bob@email.com>"}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={parseEmailInput}
                  className="btn-ghost text-sm"
                >
                  + Add Emails
                </motion.button>
              </div>

              {/* Recipients list */}
              <AnimatePresence>
                {recipients.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="card p-5"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-display font-bold text-ink-200 text-sm">
                        Recipients <span className="text-volt ml-1">{recipients.length}</span>
                      </h4>
                      <button onClick={() => setRecipients([])}
                        className="text-ember text-xs font-semibold hover:underline bg-transparent border-none cursor-pointer">
                        Clear all
                      </button>
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                      {recipients.map((r, i) => (
                        <motion.div
                          key={r.email}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-3 px-3 py-2 bg-ink-800 rounded-lg"
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-ink-950 flex-shrink-0"
                            style={{ background: `hsl(${(i * 53) % 360}, 70%, 55%)` }}>
                            {(r.name || r.email)[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            {r.name && <span className="text-ink-200 text-xs font-semibold mr-1">{r.name}</span>}
                            <span className="text-ink-500 text-xs">{r.email}</span>
                          </div>
                          <button onClick={() => setRecipients(rs => rs.filter(x => x.email !== r.email))}
                            className="text-ink-600 hover:text-ember text-base leading-none bg-transparent border-none cursor-pointer transition-colors">×</button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-1">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={back} className="btn-ghost text-sm">
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(198,241,53,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (recipients.length === 0) return toast.error('Add at least one recipient')
                    next()
                  }}
                  className="btn-primary"
                >
                  Review Campaign →
                </motion.button>
              </div>
            </div>
          )}

          {/* STEP 2: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="card p-7 space-y-0 divide-y divide-ink-700">
                <h3 className="font-display font-bold text-ink-200 pb-5">Review Before Sending</h3>
                {[
                  { label: 'Campaign', value: form.name },
                  { label: 'Subject', value: form.subject },
                  { label: 'Recipients', value: `${recipients.length} email${recipients.length !== 1 ? 's' : ''}` },
                ].map(row => (
                  <div key={row.label} className="flex gap-4 py-4">
                    <span className="text-ink-500 text-xs font-semibold uppercase tracking-widest w-28 flex-shrink-0 pt-0.5">{row.label}</span>
                    <span className="text-ink-100 text-sm font-medium">{row.value}</span>
                  </div>
                ))}
                <div className="py-4">
                  <span className="text-ink-500 text-xs font-semibold uppercase tracking-widest block mb-3">Email Preview</span>
                  <pre className="bg-ink-800 border border-ink-700 rounded-xl p-4 text-xs text-ink-400 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap font-body">
                    {form.body}
                  </pre>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex gap-3">
                <span className="text-lg">⚠️</span>
                <p className="text-amber-400/80 text-xs leading-relaxed">
                  Make sure your SMTP is configured in <strong className="text-amber-300">Settings</strong> before sending.
                  Emails are sent one-by-one with a short delay to avoid spam filters.
                </p>
              </div>

              <div className="flex justify-between">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={back} className="btn-ghost text-sm">
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(56,240,192,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={submit} disabled={submitting}
                  className="px-7 py-3 bg-aqua text-ink-950 font-display font-black text-sm rounded-xl cursor-pointer border-none disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  {submitting ? (
                    <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⟳</motion.span> Creating...</>
                  ) : '✉ Create Campaign'}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}