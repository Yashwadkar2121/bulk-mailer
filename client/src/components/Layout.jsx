import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/campaign/new', label: 'New Campaign', icon: '✉' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 h-screen w-60 bg-ink-900 border-r border-ink-700 flex flex-col z-40"
      >
        {/* Logo */}
        <div className="px-6 py-7 border-b border-ink-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-volt flex items-center justify-center">
              <span className="text-ink-950 font-display font-black text-sm">✦</span>
            </div>
            <div>
              <div className="font-display font-black text-ink-100 text-base leading-none">BulkMailer</div>
              <div className="text-ink-500 text-[10px] font-display uppercase tracking-widest mt-0.5">Send at Scale</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            return (
              <Link key={item.path} to={item.path} className="no-underline relative">
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-volt/10 border border-volt/25 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors duration-200
                  ${active ? 'text-volt' : 'text-ink-400 hover:text-ink-200'}`}>
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span className={`text-sm ${active ? 'font-display font-bold' : 'font-body font-medium'}`}>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-ink-700 pt-3">
          <div className="px-3 py-2.5 flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-volt to-aqua flex items-center justify-center flex-shrink-0">
              <span className="text-ink-950 font-display font-black text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-ink-100 text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-ink-500 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-2 rounded-xl border border-ink-600 text-ink-400 hover:text-ember hover:border-ember/50 text-xs font-display font-semibold transition-all duration-200 cursor-pointer bg-transparent"
          >
            Sign Out
          </motion.button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="ml-60 flex-1 min-h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="p-10 max-w-6xl"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}