import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Zap,
  Mail,
  Lock,
  User,
  Server,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { AnimatedButton } from "../components/AnimatedButton";
import { Input } from "../components/Input";
import { Card } from "../components/Card";

const providers = [
  {
    name: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    icon: "📧",
  },
  {
    name: "Outlook",
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    icon: "📨",
  },
  {
    name: "SendGrid",
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    icon: "🚀",
  },
  {
    name: "Mailgun",
    host: "smtp.mailgun.org",
    port: 587,
    secure: false,
    icon: "🔫",
  },
  {
    name: "Yahoo",
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true,
    icon: "🔮",
  },
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
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("smtp");

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
      toast.custom((t) => (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <span>SMTP configuration saved successfully!</span>
        </div>
      ));
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

  const applyProvider = (provider) => {
    setSmtp((s) => ({
      ...s,
      host: provider.host,
      port: provider.port,
      secure: provider.secure,
    }));
    toast.success(`${provider.name} preset applied!`, {
      icon: "✨",
    });
  };

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-slate-400 mt-1">
          Configure your email server settings
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-pink-500/20">
        {[
          { id: "smtp", label: "SMTP Configuration", icon: Server },
          { id: "security", label: "Security", icon: Shield },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-400 border-b-2 border-pink-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "smtp" && (
          <motion.div
            key="smtp"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Quick Presets */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-slate-200">Quick Setup</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {providers.map((p) => (
                  <motion.button
                    key={p.name}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => applyProvider(p)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-pink-500/20 hover:border-pink-500/50 transition-all group"
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-pink-400">
                      {p.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* SMTP Form */}
            <Card>
              <form onSubmit={save} className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-pink-400" />
                  <h3 className="font-bold text-slate-200">Server Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="SMTP Host"
                      icon={Server}
                      value={smtp.host}
                      onChange={(e) =>
                        setSmtp({ ...smtp, host: e.target.value })
                      }
                      placeholder="smtp.gmail.com"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="Port"
                      type="number"
                      value={smtp.port}
                      onChange={(e) =>
                        setSmtp({ ...smtp, port: +e.target.value })
                      }
                      placeholder="587"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Username"
                    icon={User}
                    value={smtp.user}
                    onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                  <div className="relative">
                    <Input
                      label="Password / App Password"
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      value={smtp.pass}
                      onChange={(e) =>
                        setSmtp({ ...smtp, pass: e.target.value })
                      }
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 bottom-3 text-slate-500 hover:text-pink-400 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="From Name"
                    icon={User}
                    value={smtp.fromName}
                    onChange={(e) =>
                      setSmtp({ ...smtp, fromName: e.target.value })
                    }
                    placeholder="Your Name"
                  />
                  <Input
                    label="From Email"
                    icon={Mail}
                    type="email"
                    value={smtp.fromEmail}
                    onChange={(e) =>
                      setSmtp({ ...smtp, fromEmail: e.target.value })
                    }
                    placeholder="you@domain.com"
                  />
                </div>

                {/* Secure Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-pink-500/20">
                  <button
                    type="button"
                    onClick={() =>
                      setSmtp((s) => ({ ...s, secure: !s.secure }))
                    }
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                      smtp.secure
                        ? "bg-gradient-to-r from-pink-500 to-rose-500"
                        : "bg-slate-600"
                    }`}
                  >
                    <motion.div
                      animate={{ x: smtp.secure ? 24 : 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                    />
                  </button>
                  <div>
                    <span className="text-slate-200 text-sm font-semibold flex items-center gap-2">
                      {smtp.secure
                        ? "🔒 SSL/TLS Enabled"
                        : "🔓 STARTTLS (port 587)"}
                    </span>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Use SSL for port 465, STARTTLS for port 587
                    </p>
                  </div>
                </div>

                {/* Test Result */}
                <AnimatePresence>
                  {testResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-xl flex items-center gap-3 ${
                        testResult.ok
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : "bg-rose-500/10 border border-rose-500/30"
                      }`}
                    >
                      {testResult.ok ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-semibold ${testResult.ok ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {testResult.ok
                            ? "Connection Successful!"
                            : "Connection Failed"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {testResult.msg}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <AnimatedButton
                    type="button"
                    variant="secondary"
                    onClick={test}
                    loading={testing}
                    icon={testing ? null : RefreshCw}
                    className="sm:w-auto"
                  >
                    {testing ? "Testing..." : "Test Connection"}
                  </AnimatedButton>
                  <AnimatedButton
                    type="submit"
                    variant="primary"
                    loading={saving}
                    icon={saving ? null : Save}
                    className="flex-1"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </AnimatedButton>
                </div>
              </form>
            </Card>

            {/* Help Section */}
            <Card>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20">
                  <AlertCircle className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm mb-2">
                    Need help?
                  </h4>
                  <div className="space-y-2 text-slate-400 text-xs">
                    <p>
                      <strong className="text-slate-300">Gmail users:</strong>{" "}
                      Use an App Password instead of your regular password.
                      Enable 2-Step Verification in your Google Account first.
                    </p>
                    <p>
                      <strong className="text-slate-300">
                        Outlook/Office 365:
                      </strong>{" "}
                      Use "smtp.office365.com" with port 587. Enable SMTP
                      authentication in your account settings.
                    </p>
                    <p>
                      <strong className="text-slate-300">Security:</strong> All
                      credentials are encrypted using AES-256 before storage.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-slate-200">Security Settings</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/5 to-rose-500/5 border border-pink-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-200">
                      Two-Factor Authentication
                    </span>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Add an extra layer of security to your account
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/5 to-rose-500/5 border border-pink-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-200">
                      Session Management
                    </span>
                    <span className="text-xs text-pink-400">Active</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    View and manage your active sessions
                  </p>
                  <button className="text-xs text-rose-400 hover:text-rose-300 transition-colors">
                    Log out all other devices
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/5 to-rose-500/5 border border-pink-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-200">
                      API Access
                    </span>
                    <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                      Beta
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Generate API keys for programmatic access
                  </p>
                  <button className="text-xs text-pink-400 hover:text-pink-300 transition-colors">
                    Generate API Key →
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔐</span>
                <h3 className="font-bold text-slate-200">
                  Security Best Practices
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Use unique passwords for each service
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Enable 2FA whenever possible
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Never share your API keys or credentials
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  Regularly review connected applications
                </li>
              </ul>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
