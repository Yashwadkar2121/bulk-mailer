import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";

const STEPS = ["Compose", "Recipients", "Review"];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir < 0 ? 40 : -40 }),
};

export default function NewCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState({ name: "", subject: "", body: "" });
  const [recipients, setRecipients] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const goTo = (n) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

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
    setRecipients((prev) => [...prev, ...newOnes]);
    setEmailInput("");
    if (newOnes.length) toast.success(`Added ${newOnes.length} recipient(s)`);
    else toast("All emails already added");
  };

  const handleCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
    setSubmitting(true);
    try {
      const res = await api.post("/campaign", { ...form, recipients });
      toast.success("Campaign created!");
      navigate(`/campaign/${res.data.campaign._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="text-slate-400 text-xs font-semibold hover:text-pink-400 transition-colors mb-3 flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 group"
          >
            <svg
              className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent mb-1">
            New Campaign
          </h1>
          <p className="text-slate-400 text-sm">
            Compose and send to your recipients in 3 steps
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-between gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <motion.button
                  onClick={() => i < step && goTo(i)}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300
                    ${
                      i === step
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                        : i < step
                          ? "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 cursor-pointer border border-pink-500/30"
                          : "bg-slate-800 text-slate-500 cursor-default border border-slate-700"
                    }
                  `}
                >
                  {i < step ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </motion.button>
                <span
                  className={`
                  text-xs font-medium mt-2 hidden sm:block
                  ${i === step ? "text-pink-400" : i < step ? "text-slate-400" : "text-slate-500"}
                `}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${i < step ? "bg-gradient-to-r from-pink-500 to-rose-500" : "bg-slate-700"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* STEP 0: Compose */}
            {step === 0 && (
              <div className="rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-6 sm:p-7 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✏️</span>
                  <h3 className="font-bold text-slate-200">Email Content</h3>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Campaign Name <span className="text-pink-400">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., November Newsletter"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Subject Line <span className="text-pink-400">*</span>
                    <span className="text-slate-500 normal-case tracking-normal ml-2 font-normal text-[10px]">
                      — use {"{{name}}"} to personalize
                    </span>
                  </label>
                  <input
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder="Hey {{name}}, here's something special!"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Email Body <span className="text-pink-400">*</span>
                    <span className="text-slate-500 normal-case tracking-normal ml-2 font-normal text-[10px]">
                      — HTML supported, {"{{name}}"} & {"{{email}}"} tags work
                    </span>
                  </label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all resize-y font-mono text-sm leading-relaxed"
                    placeholder={`<h2>Hi {{name}},</h2>\n<p>We have exciting news for you...</p>\n<p>Best,<br>Your Team</p>`}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(236,72,153,0.25)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (!form.name || !form.subject || !form.body)
                        return toast.error("Please fill in all fields");
                      next();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/25"
                  >
                    Next: Add Recipients
                    <svg
                      className="w-4 h-4"
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
                  </motion.button>
                </div>
              </div>
            )}

            {/* STEP 1: Recipients */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-6 sm:p-7 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👥</span>
                    <h3 className="font-bold text-slate-200">Add Recipients</h3>
                  </div>

                  {/* CSV Upload */}
                  <motion.div
                    whileHover={{
                      borderColor: "rgba(236,72,153,0.5)",
                      backgroundColor: "rgba(236,72,153,0.03)",
                    }}
                    onClick={() => fileRef.current.click()}
                    className="border-2 border-dashed border-pink-500/30 rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCSV}
                      className="hidden"
                    />
                    <div className="text-3xl mb-3">
                      {csvLoading ? "⏳" : "📄"}
                    </div>
                    <div className="font-bold text-slate-200 mb-1">
                      {csvLoading ? "Importing..." : "Upload CSV File"}
                    </div>
                    <div className="text-slate-500 text-xs">
                      CSV with email, name columns • Max 5MB
                    </div>
                  </motion.div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-pink-500/20" />
                    <span className="text-slate-500 text-xs">
                      or paste emails
                    </span>
                    <div className="flex-1 h-px bg-pink-500/20" />
                  </div>

                  <textarea
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all resize-y font-mono text-sm"
                    placeholder={
                      "john@example.com\njane@company.com\nBob Smith <bob@email.com>"
                    }
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={parseEmailInput}
                    className="px-4 py-2 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 text-sm font-medium hover:bg-pink-500/20 transition-all"
                  >
                    + Add Emails
                  </motion.button>
                </div>

                {/* Recipients list */}
                <AnimatePresence>
                  {recipients.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-5"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                          <span>📋</span>
                          Recipients
                          <span className="text-pink-400 text-xs bg-pink-500/10 px-2 py-0.5 rounded-full">
                            {recipients.length}
                          </span>
                        </h4>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRecipients([])}
                          className="text-rose-400 text-xs font-semibold hover:text-rose-300 transition-colors bg-transparent border-none cursor-pointer"
                        >
                          Clear all
                        </motion.button>
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                        {recipients.map((r, i) => (
                          <motion.div
                            key={r.email}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center gap-3 px-3 py-2 bg-slate-800/80 rounded-lg group"
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, #ec4899, #f43f5e)`,
                              }}
                            >
                              {(r.name || r.email)[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              {r.name && (
                                <span className="text-slate-200 text-sm font-medium block">
                                  {r.name}
                                </span>
                              )}
                              <span className="text-slate-500 text-xs">
                                {r.email}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                setRecipients((rs) =>
                                  rs.filter((x) => x.email !== r.email),
                                )
                              }
                              className="text-slate-500 hover:text-rose-400 text-lg leading-none bg-transparent border-none cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={back}
                    className="px-5 py-2 rounded-lg border border-pink-500/30 text-slate-400 font-medium hover:bg-pink-500/5 transition-all"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 20px rgba(236,72,153,0.25)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (recipients.length === 0)
                        return toast.error("Add at least one recipient");
                      next();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/25"
                  >
                    Review Campaign
                    <svg
                      className="w-4 h-4"
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
                  </motion.button>
                </div>
              </div>
            )}

            {/* STEP 2: Review */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-6 sm:p-7">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-2xl">✅</span>
                    <h3 className="font-bold text-slate-200">
                      Review Before Sending
                    </h3>
                  </div>

                  <div className="space-y-0 divide-y divide-pink-500/10">
                    {[
                      { label: "Campaign", value: form.name, icon: "📧" },
                      { label: "Subject", value: form.subject, icon: "📝" },
                      {
                        label: "Recipients",
                        value: `${recipients.length} email${recipients.length !== 1 ? "s" : ""}`,
                        icon: "👥",
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex gap-4 py-4">
                        <div className="w-28 flex-shrink-0">
                          <span className="text-xs font-semibold text-pink-400">
                            {row.label}
                          </span>
                        </div>
                        <span className="text-slate-200 text-sm font-medium break-words flex-1">
                          {row.value}
                        </span>
                      </div>
                    ))}

                    <div className="py-4">
                      <span className="text-xs font-semibold text-pink-400 block mb-3">
                        Email Preview
                      </span>
                      <div className="bg-slate-900/50 border border-pink-500/20 rounded-xl p-4 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                        {form.body || "No content yet"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex gap-3">
                  <span className="text-lg">⚠️</span>
                  <p className="text-amber-400/80 text-xs leading-relaxed">
                    Make sure your SMTP is configured in{" "}
                    <strong className="text-amber-300">Settings</strong> before
                    sending. Emails are sent one-by-one with a short delay to
                    avoid spam filters.
                  </p>
                </div>

                <div className="flex justify-between pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={back}
                    className="px-5 py-2 rounded-lg border border-pink-500/30 text-slate-400 font-medium hover:bg-pink-500/5 transition-all"
                  >
                    ← Back
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 24px rgba(236,72,153,0.3)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submit}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50"
                  >
                    {submitting ? (
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
                        Creating...
                      </>
                    ) : (
                      <>✉ Create Campaign</>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
