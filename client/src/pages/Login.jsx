import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-volt/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-aqua/4 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
        initial="initial"
        animate="animate"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div variants={fadeUp} className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-volt flex items-center justify-center">
              <span className="text-ink-950 font-display font-black text-lg">✦</span>
            </div>
            <span className="font-display font-black text-2xl text-ink-100">BulkMailer</span>
          </div>
          <p className="text-ink-400 text-sm">Send your message to thousands, instantly</p>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-8 shadow-card">
          <h2 className="font-display font-bold text-xl text-ink-100 mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-ink-400 text-xs font-semibold uppercase tracking-widest mb-2">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-ink-400 text-xs font-semibold uppercase tracking-widest mb-2">Password</label>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input-base"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⟳</motion.span>
                  Signing in...
                </>
              ) : 'Sign In →'}
            </motion.button>
          </form>
          <p className="text-center mt-5 text-ink-500 text-sm">
            No account?{' '}
            <Link to="/register" className="text-volt font-semibold hover:text-volt-light transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}