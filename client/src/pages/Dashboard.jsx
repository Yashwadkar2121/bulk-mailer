import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/api";
import toast from "react-hot-toast";
import clsx from "clsx";

const STATUS = {
  draft: {
    color: "text-pink-300",
    bg: "bg-pink-500/10",
    dot: "bg-pink-400",
    icon: "📝",
    label: "Draft",
  },
  sending: {
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    dot: "bg-rose-400",
    icon: "📤",
    label: "Sending",
  },
  completed: {
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    dot: "bg-fuchsia-400",
    icon: "✅",
    label: "Completed",
  },
  failed: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    dot: "bg-red-400",
    icon: "❌",
    label: "Failed",
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/campaign")
      .then((res) => setCampaigns(res.data.campaigns))
      .catch(() => toast.error("Failed to load campaigns"))
      .finally(() => setLoading(false));
  }, []);

  const deleteCampaign = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this campaign?")) return;
    try {
      await api.delete(`/campaign/${id}`);
      toast.success("Campaign deleted");
      setCampaigns((c) => c.filter((x) => x._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Campaigns",
      value: campaigns.length,
      icon: "📊",
      gradient: "from-pink-500 to-rose-400",
    },
    {
      label: "Emails Sent",
      value: campaigns
        .reduce((s, c) => s + (c.sentCount || 0), 0)
        .toLocaleString(),
      icon: "✉️",
      gradient: "from-fuchsia-500 to-pink-400",
    },
    {
      label: "Delivery Rate",
      value: (() => {
        const sent = campaigns.reduce((s, c) => s + (c.sentCount || 0), 0);
        const total = campaigns.reduce(
          (s, c) => s + (c.totalRecipients || 0),
          0,
        );
        return total > 0 ? `${Math.round((sent / total) * 100)}%` : "0%";
      })(),
      icon: "📈",
      gradient: "from-rose-500 to-pink-400",
    },
    {
      label: "Active",
      value: campaigns.filter((c) => c.status === "sending").length,
      icon: "⚡",
      gradient: "from-pink-400 to-rose-300",
    },
  ];

  const StatCard = ({ stat, index }) => (
    <motion.div
      variants={fadeInUp}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-pink-500/20 p-5"
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-15 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{stat.icon}</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            {stat.value}
          </span>
        </div>
        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
      </div>
    </motion.div>
  );

  const CampaignCard = ({ campaign }) => {
    const pct =
      campaign.totalRecipients > 0
        ? (campaign.sentCount / campaign.totalRecipients) * 100
        : 0;
    const status = STATUS[campaign.status] || STATUS.draft;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4 }}
        onClick={() => navigate(`/campaign/${campaign._id}`)}
        className="group relative rounded-xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 overflow-hidden cursor-pointer transition-all duration-300 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{status.icon}</span>
              <div>
                <h3 className="font-semibold text-slate-100 line-clamp-1">
                  {campaign.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {campaign.subject || "No subject"}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => deleteCampaign(campaign._id, e)}
              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </motion.button>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">
                <span className="text-pink-400 font-semibold">
                  {campaign.sentCount}
                </span>{" "}
                / {campaign.totalRecipients}
              </span>
              <span className="text-slate-400">{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  status.bg,
                  status.color,
                )}
              >
                {status.label}
              </span>
              <span className="text-slate-600">
                {new Date(campaign.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {campaign.failedCount > 0 && (
              <span className="text-rose-400 text-xs">
                {campaign.failedCount} failed
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const CampaignRow = ({ campaign }) => {
    const pct =
      campaign.totalRecipients > 0
        ? (campaign.sentCount / campaign.totalRecipients) * 100
        : 0;
    const status = STATUS[campaign.status] || STATUS.draft;

    return (
      <motion.tr
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        whileHover={{ backgroundColor: "rgba(236, 72, 153, 0.1)" }}
        onClick={() => navigate(`/campaign/${campaign._id}`)}
        className="cursor-pointer transition-colors border-b border-pink-500/20"
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{status.icon}</span>
            <div>
              <div className="font-medium text-slate-100">{campaign.name}</div>
              <div className="text-xs text-slate-500">{campaign.subject}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="w-32">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>
                {campaign.sentCount}/{campaign.totalRecipients}
              </span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={clsx(
              "px-2 py-1 rounded-full text-xs font-medium",
              status.bg,
              status.color,
            )}
          >
            {status.label}
          </span>
        </td>
        <td className="px-4 py-3 text-slate-500 text-sm">
          {new Date(campaign.createdAt).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => deleteCampaign(campaign._id, e)}
            className="text-slate-500 hover:text-rose-400 transition-colors"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </motion.button>
        </td>
      </motion.tr>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-4xl mb-4 text-pink-400"
          >
            ⟳
          </motion.div>
          <p className="text-slate-400">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950/30 to-slate-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
              Campaign Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Manage and track your email campaigns
            </p>
          </div>
          <Link to="/campaign/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm overflow-hidden shadow-lg shadow-pink-500/25"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">+</span> Create Campaign
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </motion.div>

        {/* Filters & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "draft", "sending", "completed", "failed"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                    statusFilter === status
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25"
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-pink-300",
                  )}
                >
                  {status}
                </button>
              ),
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                viewMode === "grid"
                  ? "bg-pink-500/20 text-pink-400"
                  : "text-slate-500 hover:text-pink-400",
              )}
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                viewMode === "list"
                  ? "bg-pink-500/20 text-pink-400"
                  : "text-slate-500 hover:text-pink-400",
              )}
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Campaigns Display */}
        {filteredCampaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-pink-500/20"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">
              No campaigns found
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter"
                : "Get started by creating your first campaign"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div
            layout
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl bg-slate-800/30 backdrop-blur-sm border border-pink-500/20 overflow-hidden"
          >
            <table className="w-full">
              <thead className="bg-slate-800/60 border-b border-pink-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pink-400 uppercase">
                    Campaign
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pink-400 uppercase">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pink-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pink-400 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-pink-400 uppercase"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredCampaigns.map((campaign) => (
                    <CampaignRow key={campaign._id} campaign={campaign} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
