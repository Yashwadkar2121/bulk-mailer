import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Grid,
  List,
  TrendingUp,
  Mail,
  Send,
  CheckCircle,
  Filter,
  Calendar,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Eye,
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { StatsCard } from "../components/StatsCard";
import { AnimatedButton } from "../components/AnimatedButton";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";

const STATUS_CONFIG = {
  draft: {
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    icon: "📝",
    label: "Draft",
  },
  sending: {
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    icon: "📤",
    label: "Sending",
  },
  completed: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    icon: "✅",
    label: "Completed",
  },
  failed: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    icon: "❌",
    label: "Failed",
  },
};

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/campaign");
      setCampaigns(res.data.campaigns);
    } catch {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async () => {
    if (!selectedCampaign) return;
    try {
      await api.delete(`/campaign/${selectedCampaign._id}`);
      toast.success("Campaign deleted successfully");
      setCampaigns((c) => c.filter((x) => x._id !== selectedCampaign._id));
      setShowDeleteModal(false);
      setSelectedCampaign(null);
    } catch {
      toast.error("Failed to delete campaign");
    }
  };

  const stats = [
    {
      title: "Total Campaigns",
      value: campaigns.length,
      icon: Send,
      trend: 12,
    },
    {
      title: "Emails Sent",
      value: campaigns
        .reduce((s, c) => s + (c.sentCount || 0), 0)
        .toLocaleString(),
      icon: Mail,
      trend: 8,
    },
    {
      title: "Success Rate",
      value: (() => {
        const sent = campaigns.reduce((s, c) => s + (c.sentCount || 0), 0);
        const total = campaigns.reduce(
          (s, c) => s + (c.totalRecipients || 0),
          0,
        );
        return total > 0 ? `${Math.round((sent / total) * 100)}%` : "0%";
      })(),
      icon: TrendingUp,
      trend: 5,
    },
    {
      title: "Active Campaigns",
      value: campaigns.filter((c) => c.status === "sending").length,
      icon: Play,
      trend: -3,
    },
  ];

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const CampaignCard = ({ campaign }) => {
    const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
    const progress =
      campaign.totalRecipients > 0
        ? (campaign.sentCount / campaign.totalRecipients) * 100
        : 0;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        className="group relative rounded-xl bg-slate-800/40 backdrop-blur-sm border border-pink-500/20 overflow-hidden cursor-pointer transition-all duration-300 hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10"
        onClick={() => (window.location.href = `/campaign/${campaign._id}`)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl ${status.bg} flex items-center justify-center text-xl`}
              >
                {status.icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 line-clamp-1">
                  {campaign.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {campaign.subject || "No subject"}
                </p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCampaign(campaign);
                  setShowDeleteModal(true);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">
                <span className="text-pink-400 font-semibold">
                  {campaign.sentCount}
                </span>{" "}
                / {campaign.totalRecipients}
              </span>
              <span className="text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
            >
              {status.label}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-pink-500/20 border-t-pink-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Manage and track your email campaigns
          </p>
        </div>

        <Link to="/campaign/new">
          <AnimatedButton icon={Plus} className="w-full sm:w-auto">
            Create Campaign
          </AnimatedButton>
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <StatsCard key={stat.title} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "draft", "sending", "completed", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
                ${
                  statusFilter === status
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-pink-500/20 text-pink-400" : "text-slate-500"}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-pink-500/20 text-pink-400" : "text-slate-500"}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Campaigns Display */}
      {filteredCampaigns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
          <div className="overflow-x-auto">
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-pink-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredCampaigns.map((campaign) => {
                    const status =
                      STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                    const progress =
                      campaign.totalRecipients > 0
                        ? (campaign.sentCount / campaign.totalRecipients) * 100
                        : 0;

                    return (
                      <motion.tr
                        key={campaign._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        whileHover={{
                          backgroundColor: "rgba(236, 72, 153, 0.1)",
                        }}
                        onClick={() =>
                          (window.location.href = `/campaign/${campaign._id}`)
                        }
                        className="cursor-pointer transition-colors border-b border-pink-500/20"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg ${status.bg} flex items-center justify-center`}
                            >
                              <span className="text-lg">{status.icon}</span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-100">
                                {campaign.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {campaign.subject}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-32">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>
                                {campaign.sentCount}/{campaign.totalRecipients}
                              </span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-sm">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCampaign(campaign);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCampaign(null);
        }}
        title="Delete Campaign"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            Delete Campaign?
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Are you sure you want to delete "{selectedCampaign?.name}"? This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <AnimatedButton
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedCampaign(null);
              }}
              className="flex-1"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              variant="primary"
              onClick={deleteCampaign}
              className="flex-1 bg-gradient-to-r from-red-500 to-rose-500"
            >
              Delete
            </AnimatedButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
