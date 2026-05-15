import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { AnimatedButton } from "../components/AnimatedButton";
import { Input } from "../components/Input";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email is invalid";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.custom((t) => (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <div>
            <p className="font-semibold">Welcome to BulkMailer!</p>
            <p className="text-xs opacity-90">
              Set up your SMTP to start sending emails
            </p>
          </div>
        </div>
      ));
      navigate("/settings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const length = form.password.length;
    if (length === 0) return null;
    if (length < 6)
      return { label: "Weak", color: "text-rose-400", bg: "bg-rose-500/20" };
    if (length < 8)
      return { label: "Good", color: "text-amber-400", bg: "bg-amber-500/20" };
    return {
      label: "Strong",
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
    };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 80, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-rose-500/8 to-orange-500/8 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="font-black text-3xl bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
              BulkMailer
            </span>
          </motion.div>
          <p className="text-slate-400 text-sm">
            Start sending bulk emails in minutes
          </p>
        </div>

        {/* Register Card */}
        <div className="relative rounded-2xl bg-slate-800/50 backdrop-blur-md border border-pink-500/20 p-8 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-t-2xl" />

          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              icon={User}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              error={errors.name}
              required
            />

            <Input
              label="Email Address"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              error={errors.email}
              required
            />

            <Input
              label="Password"
              icon={Lock}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              error={errors.password}
              required
            />

            {/* Password Strength Indicator */}
            {strength && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((form.password.length / 10) * 100, 100)}%`,
                      }}
                      className={`h-full rounded-full ${
                        form.password.length < 6
                          ? "bg-rose-500"
                          : form.password.length < 8
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${strength.color}`}>
                    {strength.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {form.password.length}/6+ characters
                </p>
              </motion.div>
            )}

            <AnimatedButton
              type="submit"
              loading={loading}
              icon={ArrowRight}
              className="w-full mt-6"
            >
              Create Account
            </AnimatedButton>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pink-500/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-slate-800/80 text-slate-500 text-xs">
                Already registered?
              </span>
            </div>
          </div>

          <Link to="/login">
            <AnimatedButton variant="secondary" className="w-full">
              Sign in to your account
            </AnimatedButton>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-6 flex justify-center gap-6">
          {[
            { label: "No credit card", icon: "✓" },
            { label: "Free to start", icon: "✓" },
            { label: "Cancel anytime", icon: "✓" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-1.5 text-xs text-slate-500"
            >
              <span className="text-pink-400">{feature.icon}</span>
              <span>{feature.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
