import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Set up your SMTP to start sending.')
      navigate('/settings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
  ]

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-aqua/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-volt/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.07 } } }}
        initial="initial" animate="animate"
        className="w-full max-w-md relative z-10"
      >
        <motion.div variants={fadeUp} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-volt flex items-center justify-center">
              <span className="text-ink-950 font-display font-black text-lg">✦</span>
            </div>
            <span className="font-display font-black text-2xl text-ink-100">BulkMailer</span>
          </div>
          <p className="text-ink-400 text-sm">Start sending bulk emails in minutes</p>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-8 shadow-card">
          <h2 className="font-display font-bold text-xl text-ink-100 mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-ink-400 text-xs font-semibold uppercase tracking-widest mb-2">{f.label}</label>
                <input
                  type={f.type} required
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="input-base"
                />
              </div>
            ))}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              type="submit" disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create Account →'}
            </motion.button>
          </form>
          <p className="text-center mt-5 text-ink-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-volt font-semibold hover:text-volt-light transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}