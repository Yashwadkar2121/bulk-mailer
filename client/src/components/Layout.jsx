import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MailPlus,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  User,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AnimatedButton } from "./AnimatedButton";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/campaign/new", label: "New Campaign", icon: MailPlus },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900">
      {/* Mobile Header */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 lg:hidden transition-all duration-300 ${scrolled ? "bg-slate-900/80 backdrop-blur-xl border-b border-pink-500/20" : "bg-transparent"}`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-100">BulkMailer</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-slate-800/50 text-pink-400"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 h-screen w-64 bg-slate-900/90 backdrop-blur-xl border-r border-pink-500/20 flex flex-col z-30 hidden lg:flex"
      >
        {/* Logo */}
        <div className="px-6 py-7 border-b border-pink-500/20">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <div className="font-black text-slate-100 text-base leading-none">
                BulkMailer
              </div>
              <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                Send at Scale
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="no-underline relative"
              >
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-pink-500/15 to-rose-500/15 text-pink-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute inset-0 border border-pink-500/30 rounded-xl"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span
                    className={`text-sm relative z-10 ${isActive ? "font-bold" : "font-medium"}`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="active-dot"
                      className="absolute left-0 w-0.5 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-3 pb-4 border-t border-pink-500/20 pt-4">
          <div className="px-3 py-2.5 flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/25">
                <span className="text-white font-black text-sm">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
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
          <AnimatedButton
            variant="ghost"
            onClick={handleLogout}
            icon={LogOut}
            className="w-full justify-center"
          >
            Sign Out
          </AnimatedButton>
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
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-screen w-72 bg-slate-900/95 backdrop-blur-xl border-r border-pink-500/20 flex flex-col z-50 lg:hidden"
            >
              {/* Header */}
              <div className="px-6 py-7 border-b border-pink-500/20 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
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
                  className="text-slate-400 hover:text-pink-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== "/dashboard" &&
                      location.pathname.startsWith(item.path));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="no-underline"
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                          ${
                            isActive
                              ? "bg-gradient-to-r from-pink-500/15 to-rose-500/15 text-pink-400 border border-pink-500/30"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span
                          className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile */}
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
                <AnimatedButton
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  icon={LogOut}
                  className="w-full justify-center"
                >
                  Sign Out
                </AnimatedButton>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 pt-20 sm:p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
