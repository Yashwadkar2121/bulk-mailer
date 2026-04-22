import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const providers = [
  { name: "Gmail", host: "smtp.gmail.com", port: 587, secure: false },
  { name: "Outlook", host: "smtp.office365.com", port: 587, secure: false },
  { name: "SendGrid", host: "smtp.sendgrid.net", port: 587, secure: false },
  { name: "Mailgun", host: "smtp.mailgun.org", port: 587, secure: false },
  { name: "Yahoo", host: "smtp.mail.yahoo.com", port: 465, secure: true },
];

export default function Settings() {
  const [smtp, setSmtp] = useState({
    host: "",
    port: 587,
    secure: false,
    user: "",
    pass: "",
    fromName: "",
    fromEmail: "",
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      if (res.data.user?.smtpConfig?.host) setSmtp(res.data.user.smtpConfig);
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/smtp", smtp);
      toast.success("SMTP configuration saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    if (!smtp.host || !smtp.user || !smtp.pass)
      return toast.error("Fill in SMTP details first");
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post("/email/test-smtp", smtp);
      setTestResult({ ok: true, msg: res.data.message });
      toast.success(res.data.message);
    } catch (err) {
      setTestResult({
        ok: false,
        msg: err.response?.data?.message || "Connection failed",
      });
      toast.error(err.response?.data?.message || "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent mb-1">
            Settings
          </h1>
          <p className="text-slate-400 text-sm">
            Configure your SMTP server to start sending
          </p>
        </motion.div>

        {/* Quick presets */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.05 }}
          className="rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-5 sm:p-6 mb-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚡</span>
            <h3 className="font-bold text-slate-200 text-sm">Quick Setup</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {providers.map((p) => (
              <motion.button
                key={p.name}
                whileHover={{
                  scale: 1.04,
                  borderColor: "rgba(236,72,153,0.5)",
                }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  setSmtp((s) => ({
                    ...s,
                    host: p.host,
                    port: p.port,
                    secure: p.secure,
                  }))
                }
                className="px-4 py-2 rounded-xl bg-slate-800 border border-pink-500/30 text-slate-300 hover:text-pink-400 text-xs font-semibold transition-all duration-200 cursor-pointer"
              >
                {p.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* SMTP Form */}
        <motion.form
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          onSubmit={save}
          className="rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-6 sm:p-7"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">⚙️</span>
            <h3 className="font-bold text-slate-200 text-sm">
              SMTP Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                SMTP Host <span className="text-pink-400">*</span>
              </label>
              <input
                value={smtp.host}
                onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Port <span className="text-pink-400">*</span>
              </label>
              <input
                type="number"
                value={smtp.port}
                onChange={(e) => setSmtp({ ...smtp, port: +e.target.value })}
                placeholder="587"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Username <span className="text-pink-400">*</span>
              </label>
              <input
                value={smtp.user}
                onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Password / App Password <span className="text-pink-400">*</span>
              </label>
              <input
                type="password"
                value={smtp.pass}
                onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                From Name
              </label>
              <input
                value={smtp.fromName}
                onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                From Email
              </label>
              <input
                type="email"
                value={smtp.fromEmail}
                onChange={(e) =>
                  setSmtp({ ...smtp, fromEmail: e.target.value })
                }
                placeholder="you@domain.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
              />
            </div>
          </div>

          {/* Secure toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-7 p-4 bg-slate-800/30 rounded-xl border border-pink-500/20">
            <button
              type="button"
              onClick={() => setSmtp((s) => ({ ...s, secure: !s.secure }))}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 border-none cursor-pointer ${smtp.secure ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-slate-600"}`}
            >
              <motion.div
                animate={{ x: smtp.secure ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
              />
            </button>
            <div>
              <span className="text-slate-200 text-sm font-semibold">
                {smtp.secure ? "🔒 SSL/TLS Enabled" : "🔓 STARTTLS (port 587)"}
              </span>
              <p className="text-slate-500 text-xs mt-0.5">
                Use SSL for port 465, STARTTLS for port 587
              </p>
            </div>
          </div>

          {/* Test result */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl mb-5 text-sm font-semibold flex items-center gap-2 ${
                testResult.ok
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
              }`}
            >
              <span>{testResult.ok ? "✓" : "✗"}</span>
              {testResult.msg}
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={test}
              disabled={testing}
              className="px-5 py-2.5 rounded-xl border border-pink-500/30 text-pink-400 font-medium hover:bg-pink-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {testing ? (
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
                  Testing...
                </>
              ) : (
                <>
                  <span>⚡</span> Test Connection
                </>
              )}
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 20px rgba(236,72,153,0.25)",
              }}
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {saving ? (
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
                  Saving...
                </>
              ) : (
                <>
                  <span>💾</span> Save Settings
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* Gmail tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-5 p-5 rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-rose-500/5"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="font-bold text-pink-400 text-sm mb-1.5">
                Gmail Users
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Use an <strong className="text-slate-200">App Password</strong>{" "}
                — not your regular Gmail password. Go to{" "}
                <strong className="text-slate-200">
                  Google Account → Security → 2-Step Verification → App
                  Passwords
                </strong>{" "}
                to generate one.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <p className="text-slate-500 text-[10px]">
            🔐 Your credentials are encrypted and stored securely
          </p>
        </motion.div>
      </div>
    </div>
  );
}
