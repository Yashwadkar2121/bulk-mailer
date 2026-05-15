import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  AlertCircle,
  Download,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  PieChart,
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import clsx from "clsx";
import { AnimatedButton } from "../components/AnimatedButton";
import { Card } from "../components/Card";

const RECIPIENT_STATUS = {
  pending: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
    icon: Clock,
  },
  sent: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
    icon: CheckCircle,
  },
  failed: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    dot: "bg-rose-400",
    icon: XCircle,
  },
};

const CAMPAIGN_STATUS = {
  draft: {
    label: "Draft",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    icon: "📝",
  },
  sending: {
    label: "Sending",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    icon: "📤",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: "✅",
  },
  failed: {
    label: "Failed",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    icon: "❌",
  },
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);
  const pollRef = useRef(null);

  const fetchCampaign = async () => {
    try {
      const res = await api.get(`/campaign/${id}`);
      setCampaign(res.data.campaign);
      return res.data.campaign;
    } catch {
      toast.error("Failed to load campaign");
    }
  };

  useEffect(() => {
    fetchCampaign();
    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => {
    if (!campaign) return;
    if (campaign.status === "sending") {
      pollRef.current = setInterval(async () => {
        const updated = await fetchCampaign();
        if (updated?.status !== "sending") clearInterval(pollRef.current);
      }, 3000);
    } else clearInterval(pollRef.current);
    return () => clearInterval(pollRef.current);
  }, [campaign?.status]);

  const startSend = async () => {
    setSending(true);
    try {
      await api.post(`/campaign/${id}/send`);
      toast.success("Campaign sending started!");
      fetchCampaign();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start");
    } finally {
      setSending(false);
    }
  };

  const exportRecipients = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/campaign/${id}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `campaign-${campaign.name}-recipients.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export started!");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-pink-500/20 border-t-pink-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400">Loading campaign...</p>
        </div>
      </div>
    );
  }

  const progress =
    campaign.totalRecipients > 0
      ? (campaign.sentCount / campaign.totalRecipients) * 100
      : 0;

  const filteredRecipients = campaign.recipients.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter;
    const matchesSearch =
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const status = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.draft;
  const filterCounts = {
    all: campaign.recipients.length,
    pending: campaign.recipients.filter((r) => r.status === "pending").length,
    sent: campaign.sentCount,
    failed: campaign.failedCount,
  };

  const stats = [
    {
      label: "Total Recipients",
      value: campaign.totalRecipients,
      icon: Users,
      gradient: "from-blue-400 to-cyan-400",
    },
    {
      label: "Sent",
      value: campaign.sentCount,
      icon: Mail,
      gradient: "from-emerald-400 to-green-400",
    },
    {
      label: "Failed",
      value: campaign.failedCount,
      icon: AlertCircle,
      gradient: "from-rose-400 to-red-400",
    },
    {
      label: "Pending",
      value:
        campaign.totalRecipients - campaign.sentCount - campaign.failedCount,
      icon: Clock,
      gradient: "from-amber-400 to-orange-400",
    },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6"
      >
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-slate-400 text-sm hover:text-pink-400 transition-colors mb-3 flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
              {campaign.name}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}
            >
              {status.icon} {status.label}
            </span>
          </div>
          <p className="text-slate-400 mt-1">{campaign.subject}</p>
        </div>

        <div className="flex gap-3">
          {campaign.status === "draft" && (
            <AnimatedButton
              onClick={startSend}
              loading={sending}
              icon={Send}
              className="shadow-lg shadow-pink-500/25"
            >
              Send Campaign
            </AnimatedButton>
          )}
          <AnimatedButton
            variant="secondary"
            onClick={exportRecipients}
            loading={exporting}
            icon={Download}
          >
            Export
          </AnimatedButton>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 p-4"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-pink-400" />
                <span
                  className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </span>
              </div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Section */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-slate-200">Send Progress</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {campaign.sentCount} of {campaign.totalRecipients} emails
              processed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400">
                Sent: {campaign.sentCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-xs text-slate-400">
                Failed: {campaign.failedCount}
              </span>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute -top-6 right-0 text-sm font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"
          >
            {Math.round(progress)}%
          </motion.div>
        </div>
      </Card>

      {/* Recipients Section */}
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-400" />
            Recipients
            <span className="text-xs text-slate-500">
              ({filteredRecipients.length} of {campaign.recipients.length})
            </span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg bg-slate-800/50 border border-pink-500/20 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-pink-500/50"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1.5">
              {["all", "pending", "sent", "failed"].map((f) => {
                const Icon = RECIPIENT_STATUS[f]?.icon || Filter;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                      filter === f
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50",
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {f} ({filterCounts[f]})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recipients Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-pink-500/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-pink-400 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-pink-400 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-pink-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-pink-400 uppercase">
                  Sent At
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-pink-400 uppercase">
                  Error
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredRecipients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-slate-500"
                    >
                      No recipients found
                    </td>
                  </tr>
                ) : (
                  filteredRecipients.map((recipient, i) => {
                    const status = RECIPIENT_STATUS[recipient.status];
                    const StatusIcon = status?.icon;

                    return (
                      <motion.tr
                        key={recipient.email}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.01 }}
                        className="border-b border-slate-700/50 hover:bg-pink-500/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-200 text-sm font-mono">
                          {recipient.email}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">
                          {recipient.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status?.bg} ${status?.text}`}
                          >
                            {StatusIcon && <StatusIcon className="w-3 h-3" />}
                            {recipient.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {recipient.sentAt
                            ? new Date(recipient.sentAt).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-rose-400 text-xs max-w-[200px] truncate">
                          {recipient.error || "—"}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Refresh button */}
        {campaign.status === "sending" && (
          <div className="mt-4 pt-4 border-t border-pink-500/20 flex justify-center">
            <button
              onClick={fetchCampaign}
              className="flex items-center gap-2 text-xs text-pink-400 hover:text-pink-300 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh status
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
