import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  LogIn,
  ArrowRight,
  Sparkles,
  Send,
  UserPlus,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.custom((t) => (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <Sparkles className="w-5 h-5" />
          <span>Welcome back! Ready to send some emails?</span>
        </div>
      ));
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", {
        style: {
          background: "#1e293b",
          color: "#f43f5e",
          border: "1px solid #f43f5e",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setForm({ email: "demo@example.com", password: "password" });
    toast.success("Demo credentials loaded!", {
      icon: "✨",
      style: {
        background: "#1e293b",
        color: "#34d399",
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center px-4 pb-10 relative overflow-hidden ">
      {/* Enhanced animated background */}
      <motion.div
        animate={{
          x: [0, 150, 0],
          y: [0, 80, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -120, 0],
          y: [0, -60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-rose-500/8 to-orange-500/8 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="w-full max-w-md relative z-10"
      >
        {/* Enhanced Logo Section */}
        <motion.div variants={fadeUp} className="text-center m-5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 mb-4 cursor-pointer"
            onClick={fillDemoCredentials}
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(236, 72, 153, 0.4)",
                  "0 0 0 20px rgba(236, 72, 153, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-500 flex items-center justify-center shadow-lg"
            >
              <Send className="w-7 h-7 text-white" />
            </motion.div>
            <span className="font-black text-3xl bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
              BulkMailer
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3 h-3 text-pink-400" />
            Send your message to thousands, instantly
            <Sparkles className="w-3 h-3 text-pink-400" />
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="relative rounded-2xl bg-slate-800/50 backdrop-blur-md border border-pink-500/20 p-8 shadow-2xl"
          whileHover={{
            boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.25)",
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Enhanced decorative elements */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-t-2xl" />
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-xl pointer-events-none" />

          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
              <LogIn className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="font-bold text-xl bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Welcome Back
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <motion.div variants={fadeUp}>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Mail className="w-3 h-3 text-pink-400" />
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all group-hover:border-pink-500/30"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={fadeUp}>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Lock className="w-3 h-3 text-pink-400" />
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-900/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all group-hover:border-pink-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-pink-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div variants={fadeUp} className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-slate-500 hover:text-pink-400 transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pink-500/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 py-1 bg-slate-800/80 text-slate-400 rounded-full backdrop-blur-sm">
                New here?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <motion.div variants={fadeUp}>
            <Link
              to="/register"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-700/50 to-slate-800/50 border border-pink-500/20 text-slate-300 font-semibold hover:border-pink-500/40 hover:from-slate-700/70 hover:to-slate-800/70 transition-all flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
              Create an account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Enhanced Demo Credentials */}
        <motion.div variants={fadeUp} className="mt-6 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fillDemoCredentials}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-pink-500/30 text-slate-400 hover:text-pink-400 text-xs transition-all group"
          >
            <Star className="w-3 h-3 text-yellow-500 group-hover:rotate-12 transition-transform" />
            <span>Try Demo:</span>
            <code className="text-pink-400">demo@example.com</code>
            <span>/</span>
            <code className="text-pink-400">password</code>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
