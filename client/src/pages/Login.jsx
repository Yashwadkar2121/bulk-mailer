import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/8 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
        initial="initial"
        animate="animate"
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div variants={fadeUp} className="text-center mb-10">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <span className="text-white font-black text-xl">✦</span>
            </div>
            <span className="font-black text-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
              BulkMailer
            </span>
          </motion.div>
          <p className="text-slate-400 text-sm">
            Send your message to thousands, instantly
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="relative rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-8 shadow-2xl"
        >
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 rounded-t-2xl" />

          <h2 className="font-bold text-xl bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-6">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    ⟳
                  </motion.span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pink-500/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-800/40 text-slate-500">
                New here?
              </span>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm">
            <Link
              to="/register"
              className="text-pink-400 font-semibold hover:text-pink-300 transition-colors inline-flex items-center gap-1 group"
            >
              Create an account
              <svg
                className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </p>
        </motion.div>

        {/* Demo credentials hint */}
        <motion.div
          variants={fadeUp}
          className="mt-6 text-center text-xs text-slate-500"
        >
          <p className="flex items-center justify-center gap-2">
            <span>🔐</span>
            Demo: demo@example.com / password
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
