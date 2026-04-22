import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/campaign/new", label: "New Campaign", icon: "✉️" },
  { path: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-pink-500/30 text-pink-400"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </motion.button>
      </div>

      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 h-screen w-64 bg-slate-900/80 backdrop-blur-xl border-r border-pink-500/20 flex flex-col z-40 hidden lg:flex"
      >
        {/* Logo */}
        <div className="px-6 py-7 border-b border-pink-500/20">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25"
            >
              <span className="text-white font-black text-lg">✦</span>
            </motion.div>
            <div>
              <div className="font-black text-slate-100 text-base leading-none">
                BulkMailer
              </div>
              <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                Send at Scale
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className="no-underline relative"
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500/15 to-rose-500/15 border border-pink-500/30 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <div
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                  ${active ? "text-pink-400" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <span className="text-lg w-5 text-center">{item.icon}</span>
                  <span
                    className={`text-sm ${active ? "font-bold" : "font-medium"}`}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="active-dot"
                      className="absolute left-0 w-0.5 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-pink-500/20 pt-4">
          <div className="px-3 py-2.5 flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/25">
              <span className="text-white font-black text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-200 text-sm font-semibold truncate">
                {user?.name}
              </div>
              <div className="text-slate-500 text-xs truncate">
                {user?.email}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-2 rounded-xl border border-pink-500/30 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 text-xs font-semibold transition-all duration-200 cursor-pointer bg-transparent"
          >
            Sign Out
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-pink-500/20 flex flex-col z-50 lg:hidden"
            >
              {/* Logo */}
              <div className="px-6 py-7 border-b border-pink-500/20 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <span className="text-white font-black text-lg">✦</span>
                  </div>
                  <div>
                    <div className="font-black text-slate-100 text-base leading-none">
                      BulkMailer
                    </div>
                    <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                      Send at Scale
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-pink-400"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const active =
                    location.pathname === item.path ||
                    (item.path !== "/dashboard" &&
                      location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="no-underline relative"
                    >
                      <div
                        className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                        ${active ? "bg-gradient-to-r from-pink-500/15 to-rose-500/15 text-pink-400" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        <span className="text-lg w-5 text-center">
                          {item.icon}
                        </span>
                        <span
                          className={`text-sm ${active ? "font-bold" : "font-medium"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* User footer */}
              <div className="px-3 pb-4 border-t border-pink-500/20 pt-4">
                <div className="px-3 py-2.5 flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200 text-sm font-semibold truncate">
                      {user?.name}
                    </div>
                    <div className="text-slate-500 text-xs truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl border border-pink-500/30 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 text-xs font-semibold transition-all duration-200 cursor-pointer bg-transparent"
                >
                  Sign Out
                </motion.button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
