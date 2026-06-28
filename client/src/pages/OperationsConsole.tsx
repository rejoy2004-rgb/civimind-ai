import React, { useState } from "react";
import { trpc } from "../lib/trpc.ts";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  AlertTriangle, 
  Check, 
  Clock, 
  ArrowRight, 
  BrainCircuit, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  UserCheck,
  MapPin,
  Activity,
  Filter,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Zap,
  HardHat
} from "lucide-react";

export const OperationsConsole: React.FC = () => {
  const { data: issues, isLoading, refetch, isRefetching } = trpc.issues.list.useQuery();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedWard, setSelectedWard] = useState<string>("all");
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const acknowledgeMutation = trpc.issues.acknowledge.useMutation({
    onSuccess: () => {
      refetch();
    },
    onSettled: () => {
      setAcknowledgingId(null);
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xs font-black tracking-widest text-[#111111] uppercase">
            BBMP Systems Syncing
          </h2>
          <p className="text-[11px] text-[#6B7280] font-semibold">
            Synchronizing municipal ward databases & SLA schedules...
          </p>
        </div>
      </div>
    );
  }

  // Get active issues list (or empty list if undefined)
  const allIssues = issues || [];

  // Helper: map addresses to wards for Bengaluru
  const getWardName = (address: string) => {
    const addr = address.toLowerCase();
    if (addr.includes("indiranagar")) return "Ward 80 (Indiranagar)";
    if (addr.includes("koramangala")) return "Ward 150 (Koramangala)";
    if (addr.includes("hsr")) return "Ward 174 (HSR Layout)";
    if (addr.includes("btm")) return "Ward 143 (BTM Layout)";
    if (addr.includes("domlur")) return "Ward 112 (Domlur)";
    if (addr.includes("silk board")) return "Ward 151 (Madivala)";
    if (addr.includes("outer ring road")) return "Ward 175 (JP Nagar)";
    if (addr.includes("halasuru") || addr.includes("ulsoor")) return "Ward 79 (Ulsoor)";
    if (addr.includes("sarjapur")) return "Ward 150 (Koramangala)";
    return "Ward 99 (General Ward)";
  };

  // 1. SLA Breach Alert System
  // Generate alerts for Critical issues that are reported/verified
  const slaAlerts = allIssues
    .filter(i => i.severity === "Critical" && i.status !== "Resolved")
    .map(i => {
      const hoursAgo = Math.max(2, Math.floor((Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60)));
      return {
        id: `alert-${i.id}`,
        issueId: i.id,
        title: i.title,
        severity: i.severity,
        assignedDepartment: i.assignedDepartment,
        hoursAgo,
        isBreached: hoursAgo > 12, // Critical SLA is 12-24 hours
        ward: getWardName(i.address)
      };
    });

  // 2. Ward-wise Issue Summary Calculations
  const wardSummaryMap: Record<string, { total: number; pending: number; inProgress: number; resolved: number }> = {};
  allIssues.forEach(i => {
    const ward = getWardName(i.address);
    if (!wardSummaryMap[ward]) {
      wardSummaryMap[ward] = { total: 0, pending: 0, inProgress: 0, resolved: 0 };
    }
    wardSummaryMap[ward].total += 1;
    if (i.status === "Reported" || i.status === "Verified") {
      wardSummaryMap[ward].pending += 1;
    } else if (i.status === "In Progress") {
      wardSummaryMap[ward].inProgress += 1;
    } else if (i.status === "Resolved") {
      wardSummaryMap[ward].resolved += 1;
    }
  });

  // 3. Department Workload Distribution
  const deptWorkloadMap: Record<string, { total: number; active: number; capacityScore: number }> = {};
  allIssues.forEach(i => {
    const dept = i.assignedDepartment || "General BBMP Works";
    if (!deptWorkloadMap[dept]) {
      // Seed initial capacity parameters for realism
      let cap = 70;
      if (dept.includes("BWSSB")) cap = 85;
      if (dept.includes("BESCOM")) cap = 60;
      deptWorkloadMap[dept] = { total: 10, active: 4, capacityScore: cap };
    }
    deptWorkloadMap[dept].total += 1;
    if (i.status !== "Resolved") {
      deptWorkloadMap[dept].active += 1;
    }
  });

  // Filter queue of actionable issues
  const filteredIssues = allIssues.filter(i => {
    const matchesStatus = filterStatus === "all" ? true : i.status === filterStatus;
    const matchesCategory = filterCategory === "all" ? true : i.category === filterCategory;
    const matchesWard = selectedWard === "all" ? true : getWardName(i.address) === selectedWard;
    return matchesStatus && matchesCategory && matchesWard;
  });

  const handleAcknowledge = async (id: string) => {
    setAcknowledgingId(id);
    try {
      await acknowledgeMutation.mutateAsync({ id });
    } catch (err) {
      console.error("Failed to acknowledge issue:", err);
      setAcknowledgingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Reported":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Verified":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-amber-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto px-1">
      
      {/* Top command ribbon branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#ECECEC] pb-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-500 text-white rounded-md text-[10px] font-black tracking-widest uppercase">
              <Zap className="w-3.5 h-3.5 animate-pulse text-yellow-300" />
              <span>COMMAND MODE</span>
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">
              IP: 10.124.0.35 // SYSLOG: SECURE
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight leading-tight">
            BBMP Command & Operations Console
          </h1>
          <p className="text-sm text-[#6B7280] font-semibold">
            Real-time municipal workflow orchestration, SLA integrity tracking, and multi-agent dispatch coordination.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-4 py-2.5 bg-white border border-[#ECECEC] hover:border-slate-300 rounded-xl text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefetching ? "animate-spin" : ""}`} />
            <span>{isRefetching ? "Syncing Grid..." : "Sync Grid"}</span>
          </button>
        </div>
      </div>

      {/* SLA Breach Alerts Header */}
      {slaAlerts.length > 0 && (
        <div className="bg-rose-500 text-white rounded-[24px] p-6 shadow-md relative overflow-hidden">
          {/* Decorative glowing backdrops */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-start space-x-4 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6 text-yellow-300 animate-bounce" />
            </div>
            <div className="space-y-4 flex-grow">
              <div>
                <h2 className="text-base font-black uppercase tracking-wider">
                  Active SLA Alerts & Critical Ward Warnings ({slaAlerts.length})
                </h2>
                <p className="text-xs text-rose-100 font-bold mt-0.5 leading-relaxed">
                  The following citizen complaints exceed safe reaction thresholds or contain hazardous structural exposure. Immediate dispatch check required.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slaAlerts.map(alert => (
                  <div key={alert.id} className="bg-black/15 hover:bg-black/25 transition-colors border border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] bg-yellow-300 text-rose-900 px-1.5 py-0.5 rounded font-black uppercase tracking-wider font-mono">
                          {alert.ward}
                        </span>
                        <span className="text-[10px] text-rose-100 font-mono font-bold">
                          {alert.hoursAgo}h elapsed
                        </span>
                      </div>
                      <p className="text-xs font-black truncate text-white mt-1.5">
                        {alert.title}
                      </p>
                      <span className="text-[10px] text-rose-200 font-semibold mt-0.5 block">
                        Assigned: {alert.assignedDepartment}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAcknowledge(alert.issueId)}
                      className="px-3 py-1.5 bg-white text-rose-700 hover:bg-rose-50 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Key Performance Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#ECECEC] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[#6B7280] text-[10px] font-extrabold uppercase tracking-widest">Active Backlog</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-[#111111]">
              {allIssues.filter(i => i.status !== "Resolved").length}
            </span>
            <span className="text-[10px] font-bold text-amber-600 font-mono">Unresolved</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">Active task pipeline queue size</p>
        </div>

        <div className="bg-white border border-[#ECECEC] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[#6B7280] text-[10px] font-extrabold uppercase tracking-widest">SLA Integrity</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-[#111111]">94.2%</span>
            <span className="text-[10px] font-bold text-emerald-600 font-mono">↑ 1.4%</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">Complaints resolved inside SLA target</p>
        </div>

        <div className="bg-white border border-[#ECECEC] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[#6B7280] text-[10px] font-extrabold uppercase tracking-widest">Escalated Priority</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-[#111111]">
              {allIssues.filter(i => i.priorityScore >= 80 && i.status !== "Resolved").length}
            </span>
            <span className="text-[10px] font-bold text-rose-600 font-mono">Urgent</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">High impact complaints (Score &gt;= 80)</p>
        </div>

        <div className="bg-white border border-[#ECECEC] rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[#6B7280] text-[10px] font-extrabold uppercase tracking-widest">Citizen Engagement</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-[#111111]">89.4%</span>
            <span className="text-[10px] font-bold text-indigo-600 font-mono">High</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">Upvoting &amp; duplicate detection rate</p>
        </div>
      </div>

      {/* Main Command Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Ward and Department Summaries */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Ward-wise Issue Summary Card */}
          <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 space-y-5 shadow-2xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#ECECEC]">
              <Building2 className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                Ward-Wise Complaint Directory
              </h3>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.keys(wardSummaryMap).length === 0 ? (
                <div className="text-center py-6 text-xs font-bold text-slate-400">No active complaints found across wards.</div>
              ) : (
                Object.entries(wardSummaryMap).map(([ward, counts]) => (
                  <button
                    key={ward}
                    onClick={() => setSelectedWard(selectedWard === ward ? "all" : ward)}
                    className={`w-full text-left p-3 border rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      selectedWard === ward 
                        ? "border-indigo-600 bg-indigo-50/10" 
                        : "border-[#ECECEC] bg-white"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-800 block truncate">{ward}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                          {counts.total} total cases
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[9px] font-mono font-black px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-amber-700 uppercase">
                        {counts.pending} Open
                      </span>
                      <span className="text-[9px] font-mono font-black px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-700 uppercase">
                        {counts.inProgress} Prog
                      </span>
                      <span className="text-[9px] font-mono font-black px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-700 uppercase">
                        {counts.resolved} Done
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-bold bg-[#FAFAFA] p-3 rounded-xl border border-[#ECECEC] flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Click on a ward to filter the command issue queue on the right!</span>
            </div>
          </div>

          {/* Department Workload Distribution */}
          <div className="bg-white border border-[#ECECEC] rounded-[24px] p-6 space-y-5 shadow-2xs">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#ECECEC]">
              <HardHat className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">
                Department Workload Distribution
              </h3>
            </div>

            <div className="space-y-4">
              {Object.entries(deptWorkloadMap).map(([dept, data]) => {
                const ratio = Math.min(100, Math.round((data.active / data.total) * 100));
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-700 truncate max-w-[280px]">{dept}</span>
                      <span className="font-mono font-black text-slate-800">{data.active} / {data.total} Active</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 border border-[#ECECEC] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          ratio > 80 ? "bg-rose-500" : ratio > 50 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${ratio}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                      <span>Assigned capacity load: {ratio}%</span>
                      <span className={data.capacityScore > 80 ? "text-rose-600" : "text-emerald-600"}>
                        {data.capacityScore > 80 ? "🚨 Critical Capacity" : "🟢 Stable Capacity"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Hand: Actionable Command Queue */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Filtering Ribbon */}
          <div className="bg-white border border-[#ECECEC] rounded-[20px] p-4 flex flex-wrap gap-4 items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2 shrink-0">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Queue Filters</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Select */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-[#FAFAFA] border border-[#ECECEC] rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer hover:border-slate-300 transition-colors"
              >
                <option value="all">All Pipeline States</option>
                <option value="Reported">Reported</option>
                <option value="Verified">Verified</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              {/* Category Select */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 bg-[#FAFAFA] border border-[#ECECEC] rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer hover:border-slate-300 transition-colors"
              >
                <option value="all">All Categories</option>
                <option value="Road Hazards & Potholes">Potholes & Roads</option>
                <option value="Water & Utilities">Water Leakage</option>
                <option value="Electrical & Streetlights">Electrical / Lights</option>
                <option value="Waste & Sanitation">Sanitation / Waste</option>
              </select>

              {/* Reset button if filter is active */}
              {(filterStatus !== "all" || filterCategory !== "all" || selectedWard !== "all") && (
                <button
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterCategory("all");
                    setSelectedWard("all");
                  }}
                  className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-500 cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Actionable Issue List Container */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6B7280]">
                Actionable Pipeline Records ({filteredIssues.length})
              </span>
              {selectedWard !== "all" && (
                <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Ward Filter: {selectedWard}
                </span>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {filteredIssues.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-[#ECECEC] rounded-[24px] p-12 text-center space-y-4"
                >
                  <div className="w-14 h-14 mx-auto bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Perfect Ward Clearance</h4>
                    <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto leading-normal">
                      No active citizen complaints match your filters. All municipal assets in this selection are structurally sound or scheduled for routine maintenance.
                    </p>
                  </div>
                </motion.div>
              ) : (
                filteredIssues.map((issue) => {
                  const isAcknowledgeLoading = acknowledgingId === issue.id && acknowledgeMutation.isPending;
                  const isHighPriority = issue.priorityScore >= 75;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={issue.id}
                      className={`bg-white border rounded-[24px] p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
                        isHighPriority ? "border-amber-200" : "border-[#ECECEC]"
                      }`}
                    >
                      {/* Top ribbon for high priority */}
                      {isHighPriority && (
                        <div className="absolute top-0 left-0 h-1 bg-amber-500 w-full"></div>
                      )}

                      {/* Header line */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#ECECEC]/60 pb-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded bg-slate-950 text-white uppercase tracking-wider">
                              {getWardName(issue.address)}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 border rounded ${getStatusBadgeClass(issue.status)}`}>
                              {issue.status}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded font-mono ${getSeverityBadgeClass(issue.severity)}`}>
                              {issue.severity}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-800 mt-2 leading-snug">
                            {issue.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold block flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[400px]">{issue.address}</span>
                          </span>
                        </div>

                        {/* Priority Score Gauge */}
                        <div className="bg-[#FAFAFA] border border-[#ECECEC] rounded-xl px-3.5 py-2 text-center shrink-0 min-w-[75px]">
                          <span className="text-slate-400 block text-[8px] font-extrabold uppercase tracking-widest leading-none mb-1">Priority</span>
                          <span className={`text-base font-black ${isHighPriority ? "text-amber-600" : "text-slate-800"}`}>
                            {issue.priorityScore}
                          </span>
                          <span className="text-slate-400 text-[8px] block font-bold leading-none">/ 100</span>
                        </div>
                      </div>

                      {/* Details Box */}
                      <div className="py-4 space-y-3">
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed font-sans">
                          {issue.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAFAFA] border border-[#ECECEC] rounded-xl p-3 text-left">
                          <div>
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block">SLA Parameter</span>
                            <span className="text-xs font-black text-slate-800 mt-0.5 block flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{issue.resolutionTimeline}</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block">Allocated Cost</span>
                            <span className="text-xs font-black text-slate-800 mt-0.5 block font-mono">
                              ₹{issue.estimatedCost.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block">Assigned Squad</span>
                            <span className="text-xs font-black text-slate-800 mt-0.5 block truncate max-w-[150px]">
                              {issue.assignedDepartment.split(" ")[0]} Division
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-[#ECECEC]/60 pt-4 mt-1">
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-[#6B7280]" />
                          <span>Verified by {issue.verificationCount} citizens</span>
                        </div>

                        {issue.status !== "Resolved" ? (
                          <button
                            onClick={() => handleAcknowledge(issue.id)}
                            disabled={isAcknowledgeLoading}
                            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-xl tracking-wider uppercase transition-all duration-300 shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            {isAcknowledgeLoading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {issue.status === "Reported" 
                                    ? "⚡ Acknowledge & Verify" 
                                    : issue.status === "Verified" 
                                    ? "🔧 Dispatch Field Crew" 
                                    : "✅ Mark as Resolved"}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1.5 bg-emerald-500/15 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl font-black text-[10px] text-emerald-700 uppercase font-mono shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Workflow Completed</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
};
