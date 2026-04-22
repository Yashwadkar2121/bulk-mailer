import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";
import clsx from "clsx";

const RECIPIENT_STATUS = {
  pending: { text: "text-pink-300", bg: "bg-pink-500/10", dot: "bg-pink-400" },
  sent: { text: "text-fuchsia-400", bg: "bg-fuchsia-500/10", dot: "bg-fuchsia-400" },
  failed: { text: "text-rose-400", bg: "bg-rose-500/10", dot: "bg-rose-400" },
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pollRef = useRef(null);

  const fetch = async () => {
    try {
      const res = await api.get(`/campaign/${id}`);
      setCampaign(res.data.campaign);
      return res.data.campaign;
    } catch {
      toast.error("Failed to load");
    }
  };

  useEffect(() => {
    fetch();
    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => {
    if (!campaign) return;
    if (campaign.status === "sending") {
      pollRef.current = setInterval(async () => {
        const updated = await fetch();
        if (updated?.status !== "sending") clearInterval(pollRef.current);
      }, 2500);
    } else clearInterval(pollRef.current);
    return () => clearInterval(pollRef.current);
  }, [campaign?.status]);

  const startSend = async () => {
    setSending(true);
    try {
      await api.post(`/campaign/${id}/send`);
      toast.success("Campaign sending started!");
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start");
    } finally {
      setSending(false);
    }
  };

  if (!campaign)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-4xl text-pink-400 inline-block mb-4"
          >
            ⟳
          </motion.span>
          <p className="text-slate-400">Loading campaign...</p>
        </div>
      </div>
    );

  const pct =
    campaign.totalRecipients > 0
      ? (campaign.sentCount / campaign.totalRecipients) * 100
      : 0;
  const filtered = campaign.recipients.filter(
    (r) => filter === "all" || r.status === filter
  );

  const filterCounts = {
    all: campaign.recipients.length,
    pending: campaign.recipients.filter((r) => r.status === "pending").length,
    sent: campaign.sentCount,
    failed: campaign.failedCount,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-4"
        >
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-slate-400 text-xs font-semibold hover:text-pink-400 transition-colors mb-3 flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0 group"
            >
              <svg className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent mb-1 break-words">
              {campaign.name}
            </h1>
            <p className="text-slate-400 text-sm break-words">{campaign.subject}</p>
          </div>

          {/* Action button */}
          <div className="self-start sm:self-auto">
            {campaign.status === "draft" && (
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(236, 72, 153, 0.35)" }}
                whileTap={{ scale: 0.96 }}
                onClick={startSend}
                disabled={sending}
                className="w-full sm:w-auto px-4 sm:px-7 py-2.5 sm:py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-lg shadow-pink-500/25"
              >
                {sending ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⟳
                    </motion.span>
                    Starting...
                  </>
                ) : (
                  "🚀 Send Campaign"
                )}
              </motion.button>
            )}
            {campaign.status === "sending" && (
              <motion.div
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold text-xs sm:text-sm flex items-center gap-2"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                >
                  ⟳
                </motion.span>
                Sending live...
              </motion.div>
            )}
            {campaign.status === "completed" && (
              <div className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 font-bold text-xs sm:text-sm flex items-center gap-2">
                <span>✓</span> Completed
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6"
        >
          {[
            { label: "Total", value: campaign.totalRecipients, gradient: "from-slate-100 to-slate-300" },
            { label: "Sent", value: campaign.sentCount, gradient: "from-fuchsia-400 to-pink-400" },
            { label: "Failed", value: campaign.failedCount, gradient: "from-rose-400 to-red-400" },
            {
              label: "Pending",
              value: campaign.totalRecipients - campaign.sentCount - campaign.failedCount,
              gradient: "from-pink-300 to-rose-300",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-3 sm:p-5"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-xl" />
              <p className="text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1 sm:mb-2">
                {s.label}
              </p>
              <motion.p
                key={s.value}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`font-bold text-xl sm:text-3xl bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}
              >
                {s.value}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-4 sm:p-6 mb-6"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-slate-200 text-xs sm:text-sm">Send Progress</span>
            <motion.span
              key={pct}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-bold text-lg sm:text-xl bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"
            >
              {Math.round(pct)}%
            </motion.span>
          </div>
          <div className="h-2 sm:h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          {campaign.failedCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-3 sm:gap-4">
              <span className="text-fuchsia-400 text-[10px] sm:text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                Sent: {campaign.sentCount}
              </span>
              <span className="text-rose-400 text-[10px] sm:text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Failed: {campaign.failedCount}
              </span>
            </div>
          )}
        </motion.div>

        {/* Recipients Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-4 sm:p-6"
        >
          {/* Filter Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <span>📋</span> Recipients
            </h3>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              {["all", "pending", "sent", "failed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all duration-200 border-none cursor-pointer capitalize whitespace-nowrap",
                    filter === f
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-pink-300"
                  )}
                >
                  {f} ({filterCounts[f]})
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm border-collapse min-w-[640px] sm:min-w-full">
              <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm">
                <tr className="border-b border-pink-500/20">
                  {["Email", "Name", "Status", "Sent At", "Error"].map((h) => (
                    <th
                      key={h}
                      className="px-3 sm:px-4 py-2 sm:py-3 text-left text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 sm:py-12 text-slate-500 text-sm">
                        No recipients in this filter
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => {
                      const s = RECIPIENT_STATUS[r.status];
                      return (
                        <motion.tr
                          key={r.email}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-slate-700/50 hover:bg-pink-500/5 transition-colors"
                        >
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-200 text-[11px] sm:text-xs font-mono break-words max-w-[180px] sm:max-w-none">
                            {r.email}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-400 text-[11px] sm:text-xs">
                            {r.name || "—"}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3">
                            <span
                              className={clsx(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium",
                                s.bg,
                                s.text
                              )}
                            >
                              <span className={clsx("w-1.5 h-1.5 rounded-full", s.dot)} />
                              {r.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-slate-500 text-[10px] sm:text-xs whitespace-nowrap">
                            {r.sentAt ? new Date(r.sentAt).toLocaleString() : "—"}
                          </td>
                          <td className="px-3 sm:px-4 py-2 sm:py-3 text-rose-400 text-[10px] sm:text-xs max-w-[150px] sm:max-w-[180px] truncate">
                            {r.error || "—"}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Summary */}
          <div className="mt-4 pt-3 border-t border-pink-500/20 sm:hidden">
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                Showing {filtered.length} of {campaign.recipients.length}
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-pink-400 font-semibold"
              >
                {mobileMenuOpen ? "Show less" : "Show details"}
              </button>
            </div>
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2 text-xs"
                >
                  <div className="flex justify-between">
                    <span className="text-slate-500">Success rate:</span>
                    <span className="text-pink-400 font-mono">
                      {campaign.totalRecipients > 0
                        ? Math.round((campaign.sentCount / campaign.totalRecipients) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery rate:</span>
                    <span className="text-pink-400 font-mono">
                      {campaign.sentCount > 0
                        ? Math.round(
                            (campaign.sentCount / (campaign.sentCount + campaign.failedCount)) * 100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}