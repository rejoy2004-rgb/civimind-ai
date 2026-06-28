import React, { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc.ts";
import { useAuth } from "../_core/hooks/useAuth.ts";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText,
  MapPin, 
  Search,
  ThumbsUp,
  AlertCircle,
  Check,
  Plus,
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  Lock,
  Mail,
  Settings,
  Bell
} from "lucide-react";

export const Home: React.FC = () => {
  const { user, refetch: refetchUser } = useAuth();
  
  // States
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success"
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => {
        if (prev.message === message) {
          return { ...prev, show: false };
        }
        return prev;
      });
    }, 4000);
  };

  // Queries
  const { data: issuesList, isLoading, refetch } = trpc.issues.list.useQuery({
    category: selectedCategory,
    status: "all",
  });

  const { data: stats } = trpc.issues.stats.useQuery();

  // Mutations
  const verifyMutation = trpc.verification.verify.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (err) => {
      alert(err.message || "You have already upvoted/verified this issue.");
    }
  });

  const updateWeeklyDigestMutation = trpc.auth.updateWeeklyDigest.useMutation({
    onSuccess: (data) => {
      refetchUser();
      const statusText = data?.weeklyDigestEnabled ? "subscribed to" : "unsubscribed from";
      showToast(`Email settings updated! You have successfully ${statusText} the weekly digest.`, "success");
    },
    onError: (err) => {
      showToast(err.message || "Failed to update notification settings.", "error");
    }
  });

  const handleUpvote = async (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid navigating to details
    e.preventDefault();
    await verifyMutation.mutateAsync({ issueId, comment: "Verified via citizen dashboard." });
  };

  // Filter lists on search query
  const filteredIssues = (issuesList || []).filter(issue => 
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (issue.address || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "Road Hazards & Potholes", label: "Roads & Potholes" },
    { id: "Water & Utilities", label: "Water & Utilities" },
    { id: "Electrical & Streetlights", label: "Electrical & Power" },
  ];

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      Reported: "bg-amber-50 text-amber-700 border-amber-100/80",
      Verified: "bg-purple-50 text-purple-700 border-purple-100/80",
      "In Progress": "bg-blue-50 text-blue-700 border-blue-100/80",
      Resolved: "bg-emerald-50 text-emerald-700 border-emerald-100/80",
    };
    return map[status] || "bg-slate-50 text-slate-700 border-slate-100";
  };

  // Dynamically calculate the user's reported count
  const userReportsCount = user ? (issuesList || []).filter(i => i.reporterId === user.id).length : 2;

  const getUserRank = (points: number) => {
    if (points < 100) return "🏆 Rookie";
    if (points < 300) return "🏆 Active Citizen";
    if (points < 600) return "🏆 Civic Hero";
    return "🏆 Elite Guardian";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  } as const;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1280px] mx-auto space-y-10 pb-24 pt-4 px-2"
    >
      {/* Welcome & Header section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            CIVIMIND HUB
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight mt-2.5">
            Welcome back, {user?.name || "Mock User"}
          </h1>
          <p className="text-[#6B7280] font-medium text-sm mt-1">
            Let's collaborate to make our neighborhood safer, cleaner, and more vibrant.
          </p>
        </div>

        {/* Primary Action Button */}
        <Link href="/report">
          <motion.button 
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center space-x-2.5 px-8 py-[18px] bg-slate-950 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white font-black rounded-full transition-all duration-300 text-xs cursor-pointer shadow-md group border border-slate-900 hover:border-transparent"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Report new issue</span>
            <ArrowRight className="w-4 h-4 opacity-75 group-hover:translate-x-1 transition-transform text-white" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Premium Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 shadow-2xs transition-all flex flex-col justify-between min-h-[135px]"
        >
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Total Reports</div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-[#111111]">{stats?.total ?? 12}</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <FileText className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="text-[10px] text-emerald-600 font-extrabold mt-2 flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-full w-max">
            <span>+12% this week</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 shadow-2xs transition-all flex flex-col justify-between min-h-[135px]"
        >
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Resolved</div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-emerald-600">
                {stats?.total && stats.total > 0 
                  ? `${Math.round((stats.resolved / stats.total) * 100)}%` 
                  : "98%"}
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Check className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-2">
            Resolution rate
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 shadow-2xs transition-all flex flex-col justify-between min-h-[135px]"
        >
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Your Reports</div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-indigo-600">{userReportsCount}</span>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold mt-2">
            Active dispatch
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 shadow-2xs transition-all flex flex-col justify-between min-h-[135px]"
        >
          <div>
            <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Points</div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black text-amber-600">{user?.points ?? 50}</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="text-[10px] text-amber-700 font-extrabold mt-2 bg-amber-50 px-2.5 py-0.5 rounded-full w-max border border-amber-100">
            {getUserRank(user?.points ?? 50)}
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid: Feed & Right Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Recent Issues Feed */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#ECECEC] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#111111]">Active Incident Feed</h2>
              <p className="text-xs text-[#6B7280] font-medium">Verify or browse recent reports in your area</p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search description, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#ECECEC] rounded-full text-xs font-medium text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </motion.div>

          {/* Categories Selector Pills */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? "bg-slate-950 text-white border-slate-950 shadow-sm"
                    : "bg-white text-[#6B7280] border-[#ECECEC] hover:bg-[#FAFAFA]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </motion.div>

          {/* Issue List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white border border-[#ECECEC] rounded-[18px] space-y-3">
                <div className="w-7 h-7 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-xs text-[#6B7280] font-semibold">Retrieving community data...</span>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white border border-[#ECECEC] rounded-[18px] text-center space-y-4">
                <AlertCircle className="w-8 h-8 text-[#9CA3AF]" />
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">No issues matching selection</h3>
                  <p className="text-xs text-[#6B7280] max-w-sm mt-1">
                    Try modifying your search or be the first to report an issue in this category.
                  </p>
                </div>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <Link key={issue.id} href={`/issue/${issue.id}`}>
                  <motion.div 
                    whileHover={{ y: -4, boxShadow: "0 12px 24px -10px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.03)", borderColor: "#D1D5DB" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="block bg-white border border-[#ECECEC] rounded-[18px] p-6 shadow-2xs cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Title and Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="font-bold text-lg text-[#111111] leading-snug group-hover:text-indigo-600 transition-colors">
                            {issue.title}
                          </h3>
                          <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 border rounded-full self-start shrink-0 ${getStatusBadge(issue.status)}`}>
                            {issue.status}
                          </span>
                        </div>

                        {/* Category Label */}
                        <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50/50 px-2.5 py-0.5 rounded-md">
                          {issue.category}
                        </span>

                        {/* Description excerpt */}
                        <p className="text-xs text-[#6B7280] font-medium leading-relaxed pt-1 line-clamp-2">
                          {issue.description || "No description provided."}
                        </p>

                        {/* Details Footer */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#9CA3AF] font-medium pt-4">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                            <span className="truncate max-w-[200px] sm:max-w-md">{issue.address || "Unknown Address"}</span>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="font-semibold text-slate-700">
                              {issue.verificationCount || 0} verifications
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vote Widget */}
                      <div className="flex flex-col items-center justify-center border-l border-[#ECECEC] pl-5 shrink-0 min-w-[72px]">
                        <span className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">Priority</span>
                        <span className="text-2xl font-black text-[#111111] mt-0.5">{issue.priorityScore}</span>
                        <button
                          onClick={(e) => handleUpvote(issue.id, e)}
                          disabled={verifyMutation.isPending || issue.status === "Resolved"}
                          className="mt-3 p-2 bg-[#FAFAFA] hover:bg-indigo-50 border border-[#ECECEC] hover:border-indigo-100 rounded-full text-[#6B7280] hover:text-indigo-600 transition-all cursor-pointer"
                          title="Verify / Upvote"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </motion.div>
        </div>

        {/* Right 1 Col: Quick Tips & Info Panel */}
        <div className="space-y-6">
          <motion.div 
            variants={itemVariants} 
            whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-gradient-to-br from-[#7C3AED]/5 to-[#2563EB]/5 border border-[#ECECEC] rounded-[18px] p-6 space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#111111]">Civic AI Registry</h3>
              <p className="text-xs text-[#6B7280] font-medium leading-relaxed mt-1">
                CiviMind is powered by Gemini AI and a multi-agent validation pipeline. Every incident reported undergoes semantic classification and priority indexing.
              </p>
            </div>
            <div className="border-t border-[#ECECEC] pt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111]">Current City Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                ● Connected
              </span>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)", borderColor: "#cbd5e1" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 space-y-4"
          >
            <h4 className="font-bold text-sm text-[#111111]">Gamified Contributions</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0">+50</div>
                <div className="text-xs font-semibold text-[#6B7280]">Points for reporting a verified incident</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">+10</div>
                <div className="text-xs font-semibold text-[#6B7280]">Points for verifying neighborhood issues</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">+100</div>
                <div className="text-xs font-semibold text-[#6B7280]">Bonus for achieving Top Contributor rank</div>
              </div>
            </div>
          </motion.div>

          {/* Citizen Preferences Card */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)", borderColor: "#cbd5e1" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 space-y-4"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Settings className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-[#111111]">Citizen Notifications</h4>
            </div>
            
            <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
              Stay updated on city improvements and issues in your neighborhood.
            </p>

            <div className="border-t border-[#ECECEC] pt-4 flex items-center justify-between">
              <div className="flex items-start space-x-2.5 max-w-[80%]">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-[#111111] block">Weekly Digest Email</span>
                  <span className="text-[10px] text-[#6B7280] font-semibold leading-tight block mt-1">
                    Automated report summarizing progress on issues you tracked or reported.
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  updateWeeklyDigestMutation.mutate({ enabled: !user?.weeklyDigestEnabled });
                }}
                disabled={updateWeeklyDigestMutation.isPending}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  user?.weeklyDigestEnabled ? "bg-indigo-600" : "bg-gray-200"
                } ${updateWeeklyDigestMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    user?.weeklyDigestEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </motion.div>
        </div>

      </div>

      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border border-[#ECECEC] rounded-2xl p-4 shadow-xl flex items-start space-x-3.5"
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === "success" 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                : "bg-rose-50 text-rose-600 border border-rose-100"
            }`}>
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 animate-pulse" />
              ) : (
                <AlertCircle className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div className="flex-grow space-y-1">
              <h5 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                {toast.type === "success" ? "Settings Saved" : "System Error"}
              </h5>
              <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest cursor-pointer px-1 shrink-0"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
