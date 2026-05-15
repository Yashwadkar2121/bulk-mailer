import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Users,
  FileText,
  CheckCircle,
  Upload,
  X,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { AnimatedButton } from "../components/AnimatedButton";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

const STEPS = [
  { id: "compose", label: "Compose", icon: FileText },
  { id: "recipients", label: "Recipients", icon: Users },
  { id: "review", label: "Review", icon: CheckCircle },
];

export default function NewCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", subject: "", body: "" });
  const [recipients, setRecipients] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const validateStep = () => {
    const newErrors = {};
    if (step === 0) {
      if (!form.name.trim()) newErrors.name = "Campaign name is required";
      if (!form.subject.trim()) newErrors.subject = "Subject line is required";
      if (!form.body.trim()) newErrors.body = "Email body is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const back = () => setStep(step - 1);

  const parseEmailInput = () => {
    const lines = emailInput
      .split(/[\n,;]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed = lines
      .map((line) => {
        const match =
          line.match(/^(.+)<(.+@.+)>$/) || line.match(/^(.+)\s+(.+@.+)$/);
        if (match) return { name: match[1].trim(), email: match[2].trim() };
        if (line.includes("@")) return { name: "", email: line };
        return null;
      })
      .filter(Boolean);

    const newOnes = parsed.filter(
      (p) => !recipients.find((r) => r.email === p.email),
    );

    if (newOnes.length) {
      setRecipients((prev) => [...prev, ...newOnes]);
      setEmailInput("");
      toast.success(`Added ${newOnes.length} recipient(s)`);
    } else {
      toast.error("No new valid emails found");
    }
  };

  const removeRecipient = (email) => {
    setRecipients((prev) => prev.filter((r) => r.email !== email));
    toast.success("Recipient removed");
  };

  const handleCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setCsvLoading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await api.post("/email/parse-csv", fd);
      const newOnes = res.data.recipients.filter(
        (p) => !recipients.find((r) => r.email === p.email),
      );
      setRecipients((prev) => [...prev, ...newOnes]);
      toast.success(`Imported ${newOnes.length} recipients from CSV`);
    } catch (err) {
      toast.error(err.response?.data?.message || "CSV import failed");
    } finally {
      setCsvLoading(false);
      fileRef.current.value = "";
    }
  };

  const submit = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/campaign", { ...form, recipients });
      toast.success("Campaign created successfully!");
      navigate(`/campaign/${res.data.campaign._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="text-slate-400 text-sm hover:text-pink-400 transition-colors mb-3 flex items-center gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
          New Campaign
        </h1>
        <p className="text-slate-400 mt-1">
          Create and send email campaigns in 3 easy steps
        </p>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: step === i ? 1.1 : 1,
                }}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300
                  ${
                    step === i
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                      : step > i
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
              >
                {step > i ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </motion.div>
              <span
                className={`text-xs font-medium mt-2 hidden sm:block ${
                  step === i
                    ? "text-pink-400"
                    : step > i
                      ? "text-emerald-400"
                      : "text-slate-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 transition-all duration-300 ${
                  step > i
                    ? "bg-gradient-to-r from-emerald-500 to-pink-500"
                    : "bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card>
              <div className="space-y-5">
                <Input
                  label="Campaign Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., November Newsletter"
                  required
                  error={errors.name}
                />

                <Input
                  label="Subject Line"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="Hey {{name}}, here's something special!"
                  helper="Use {{name}} to personalize the subject line"
                  required
                  error={errors.subject}
                />

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    Email Body <span className="text-pink-400">*</span>
                  </label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    rows={12}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-800/50 border text-slate-200 placeholder-slate-500 focus:outline-none transition-all resize-y font-mono text-sm
                      ${errors.body ? "border-red-500/50 focus:ring-red-500/20" : "border-pink-500/20 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20"}`}
                    placeholder={`<h2>Hi {{name}},</h2>\n\n<p>We have exciting news for you...</p>\n\n<p>Best regards,<br>Your Team</p>`}
                  />
                  {errors.body && (
                    <p className="text-xs text-red-400 mt-1">{errors.body}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                    <span>💡</span>
                    HTML supported • Use {"{{name}}"} and {"{{email}}"} for
                    personalization
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <AnimatedButton onClick={next}>
                    Next: Add Recipients
                  </AnimatedButton>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="recipients"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5"
          >
            {/* CSV Upload */}
            <Card>
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => fileRef.current.click()}
                  className="border-2 border-dashed border-pink-500/30 rounded-xl p-8 cursor-pointer transition-all hover:border-pink-500/50 hover:bg-pink-500/5"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSV}
                    className="hidden"
                  />
                  {csvLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-3"
                      />
                      <div className="font-semibold text-slate-200">
                        Importing...
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-pink-400 mx-auto mb-3" />
                      <div className="font-semibold text-slate-200 mb-1">
                        Upload CSV File
                      </div>
                      <div className="text-slate-500 text-xs">
                        CSV with email, name columns • Max 5MB
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </Card>

            {/* Manual Entry */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-pink-400" />
                  <h3 className="font-semibold text-slate-200">Manual Entry</h3>
                </div>

                <textarea
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all resize-y font-mono text-sm"
                  placeholder="john@example.com
jane@company.com
Bob Smith <bob@email.com>"
                />

                <AnimatedButton
                  variant="secondary"
                  onClick={parseEmailInput}
                  icon={Plus}
                  className="w-full sm:w-auto"
                >
                  Add Emails
                </AnimatedButton>
              </div>
            </Card>

            {/* Recipients List */}
            {recipients.length > 0 && (
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-400" />
                    Recipients
                    <span className="text-xs text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
                      {recipients.length}
                    </span>
                  </h3>
                  <button
                    onClick={() => setRecipients([])}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {recipients.map((r) => (
                    <motion.div
                      key={r.email}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg group hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {(r.name || r.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        {r.name && (
                          <div className="text-slate-200 text-sm font-medium truncate">
                            {r.name}
                          </div>
                        )}
                        <div className="text-slate-500 text-xs truncate">
                          {r.email}
                        </div>
                      </div>
                      <button
                        onClick={() => removeRecipient(r.email)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex justify-between pt-4">
              <AnimatedButton variant="secondary" onClick={back}>
                ← Back
              </AnimatedButton>
              <AnimatedButton onClick={next} disabled={recipients.length === 0}>
                Review Campaign
              </AnimatedButton>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5"
          >
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-pink-400" />
                  <h3 className="font-bold text-slate-200">Campaign Summary</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-4 py-2 border-b border-pink-500/10">
                    <div className="w-24 flex-shrink-0">
                      <span className="text-xs font-semibold text-pink-400">
                        Campaign
                      </span>
                    </div>
                    <span className="text-slate-200 text-sm">{form.name}</span>
                  </div>

                  <div className="flex gap-4 py-2 border-b border-pink-500/10">
                    <div className="w-24 flex-shrink-0">
                      <span className="text-xs font-semibold text-pink-400">
                        Subject
                      </span>
                    </div>
                    <span className="text-slate-200 text-sm">
                      {form.subject}
                    </span>
                  </div>

                  <div className="flex gap-4 py-2 border-b border-pink-500/10">
                    <div className="w-24 flex-shrink-0">
                      <span className="text-xs font-semibold text-pink-400">
                        Recipients
                      </span>
                    </div>
                    <span className="text-slate-200 text-sm">
                      {recipients.length} email addresses
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-semibold text-pink-400 block mb-3">
                    Email Preview
                  </span>
                  <div className="bg-slate-900/50 border border-pink-500/20 rounded-xl p-4 max-h-60 overflow-y-auto">
                    <div
                      className="prose prose-invert max-w-none text-sm"
                      dangerouslySetInnerHTML={{
                        __html: form.body || "No content yet",
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="text-amber-400/80 text-xs leading-relaxed">
                <p>
                  <strong className="text-amber-300">Important:</strong> Make
                  sure your SMTP is configured in Settings before sending.
                </p>
                <p className="mt-1">
                  Emails are sent one-by-one with a short delay to avoid spam
                  filters.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <AnimatedButton variant="secondary" onClick={back}>
                ← Back
              </AnimatedButton>
              <AnimatedButton onClick={submit} loading={submitting} icon={Send}>
                {submitting ? "Creating..." : "Create Campaign"}
              </AnimatedButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
