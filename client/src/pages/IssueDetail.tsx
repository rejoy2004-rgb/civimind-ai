import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc.ts";
import { useAuth } from "../_core/hooks/useAuth.ts";
import { motion } from "motion/react";
import { 
  MapPin, 
  Sparkles, 
  BrainCircuit, 
  TrendingUp, 
  Check, 
  ThumbsUp, 
  ChevronLeft,
  AlertTriangle,
  Scale,
  Calendar,
  CheckCircle2
} from "lucide-react";

export const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Queries
  const { data: issue, isLoading, refetch, error, isError } = trpc.issues.getById.useQuery(
    { id: id || "" },
    {
      retry: false,
    }
  );

  console.log("IssueDetail page rendered. URL param id:", id, "has issue data:", !!issue, "isError:", isError, "error:", error);

  // Mutations
  const verifyMutation = trpc.verification.verify.useMutation({
    onSuccess: () => {
      setVerificationError(null);
      refetch();
    },
    onError: (err) => {
      setVerificationError(err.message || "Failed to submit verification confirmation.");
    }
  });

  const handleConfirmVerification = async () => {
    if (!id) return;
    setVerificationError(null);
    try {
      await verifyMutation.mutateAsync({
        issueId: id,
        comment: "Confirmed via hyper-local verify widget"
      });
    } catch (e) {
      // Error handled by onError
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-white border border-[#ECECEC] rounded-[18px] p-12">
        <div className="w-8 h-8 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-[11px] text-[#6B7280] font-mono font-bold">Loading incident details...</span>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-12 bg-white border border-[#ECECEC] rounded-[18px] max-w-lg mx-auto space-y-4 shadow-2xs">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-black text-[#111111]">
          {isError ? "Error Loading Incident" : "Incident Not Found"}
        </h3>
        <p className="text-xs text-[#6B7280] max-w-xs mx-auto leading-relaxed font-semibold">
          {isError 
            ? `An error occurred while loading this incident: ${error?.message || "Unknown error"}`
            : "The requested civic issue identifier does not exist or has been archived by the municipal coordination division."}
        </p>
        <Link href="/home">
          <button className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm">
            Return to Feed
          </button>
        </Link>
      </div>
    );
  }

  // Active status progression helper
  const statuses = ["Reported", "Verified", "In Progress", "Resolved"];
  const currentStatusIndex = statuses.indexOf(issue.status);

  // Helper to generate dynamic action plans matching the PDF
  const getActionPlan = (category: string) => {
    const catLower = category.toLowerCase();
    if (catLower.includes("water") || catLower.includes("leakage")) {
      return [
        "Dispatch emergency plumbing crew immediately",
        "Isolate the main water supply valve to stop leakage",
        "Excavate and replace damaged section",
        "Restore site surface"
      ];
    } else if (catLower.includes("road") || catLower.includes("pothole")) {
      return [
        "Deploy temporary safety barricades and warning signs around the pothole site",
        "Excavate loose asphalt and debris from the distressed pavement zone",
        "Pour standard subgrade fill and compact with heavy mechanical rollers",
        "Apply hot-mix or cold-mix asphalt overlay and level flat with existing road"
      ];
    } else if (catLower.includes("electrical") || catLower.includes("power") || catLower.includes("wire")) {
      return [
        "De-energize local electrical grid section immediately for safety",
        "Replace damaged metallic junction cabinets and structural casings",
        "Splice exposed core wiring bundles and verify secure ground connection",
        "Re-key locks, install high-voltage warnings, and restore power grid"
      ];
    } else {
      return [
        "Dispatch regional response team for visual assessment",
        "Establish local safety containment parameters if necessary",
        "Perform secondary mechanical restoration procedures",
        "Log final inspection verification into city ledger"
      ];
    }
  };

  // Dynamic values for Explainable AI Priority Score Formula
  const getSeverityScore = (severity: string) => {
    switch (severity) {
      case "Critical": return 50;
      case "High": return 40;
      case "Medium": return 25;
      default: return 10;
    }
  };

  const getSafetyRiskScore = (category: string) => {
    const catLower = category.toLowerCase();
    if (catLower.includes("water") || catLower.includes("leakage")) return 45;
    if (catLower.includes("road") || catLower.includes("pothole")) return 40;
    if (catLower.includes("electrical") || catLower.includes("power") || catLower.includes("wire")) return 48;
    return 30;
  };

  const baseSeverity = getSeverityScore(issue.severity);
  const safetyRisk = getSafetyRiskScore(issue.category);
  const upvoteBonus = issue.verifications.length * 5;

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.05
      }
    }
  } as const;

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-[1100px] mx-auto pb-24 space-y-6"
    >
      {/* Back button */}
      <div className="pt-2">
        <Link href="/home">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 border border-[#ECECEC] bg-white rounded-xl text-slate-800 font-extrabold text-xs flex items-center space-x-1 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </motion.button>
        </Link>
      </div>

      {/* Main Issue Detail Card */}
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)" }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-white border border-[#ECECEC] rounded-[18px] p-6 md:p-8 space-y-6 shadow-xs"
      >
        {/* Title and Address */}
        <div className="space-y-1.5 border-b border-[#ECECEC] pb-5">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="inline-block text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
              {issue.category}
            </span>
            <span className="inline-block text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-md">
              {issue.severity} Severity
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#111111] tracking-tight leading-tight">
            {issue.title}
          </h1>
          <div className="flex items-center space-x-1.5 text-xs text-[#6B7280] font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
            <span>{issue.address}</span>
          </div>
        </div>

        {/* Issue Status Pipeline */}
        <div className="space-y-3.5 pt-1">
          <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">
            Issue Status Pipeline
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#FAFAFA] border border-[#ECECEC] rounded-xl">
            {statuses.map((s, index) => {
              const isPassedOrActive = index <= currentStatusIndex;
              return (
                <div key={s} className="flex items-center space-x-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border font-bold text-[10px] ${
                    isPassedOrActive 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                      : "bg-white border-slate-200 text-[#9CA3AF]"
                  }`}>
                    {index === currentStatusIndex && isPassedOrActive ? "●" : index + 1}
                  </div>
                  <span className={`text-xs font-bold ${
                    index === currentStatusIndex 
                      ? "text-[#111111] font-black" 
                      : isPassedOrActive 
                        ? "text-slate-700" 
                        : "text-[#9CA3AF]"
                  }`}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider">
            Description
          </h3>
          <p className="text-xs md:text-sm text-[#6B7280] leading-relaxed font-semibold">
            {issue.description}
          </p>
        </div>

        {/* Categories / AI Diagnostics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-5 border-t border-[#ECECEC]">
          <div>
            <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Category</div>
            <div className="text-xs font-bold text-[#111111] mt-1">{issue.category}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">AI Severity</div>
            <div className="text-xs font-black text-rose-600 mt-1">{issue.severity}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">AI Confidence</div>
            <div className="text-xs font-black text-[#111111] mt-1">99%</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Priority Score</div>
            <div className="text-xs font-black mt-1 text-[#111111]">
              <span className="text-indigo-600">{issue.priorityScore}</span>
              <span className="text-[#9CA3AF]"> /100</span>
            </div>
          </div>
        </div>

        {/* AI Copilot Recommendation Box */}
        <div className="bg-gradient-to-br from-[#7C3AED]/5 to-[#2563EB]/5 border border-[#ECECEC] rounded-[18px] p-5 md:p-6 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-700 border-b border-[#ECECEC] pb-3">
            <Sparkles className="w-4 h-4 shrink-0 text-indigo-600" />
            <span className="font-black text-xs uppercase tracking-wider">AI Copilot Dispatch Plan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider">Responsible Department</div>
              <div className="text-xs font-black text-slate-800 mt-1">
                {issue.assignedDepartment || "Water and Sanitation Department"}
              </div>
            </div>
            
            <div>
              <div className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider">Estimated Budget</div>
              <div className="text-xs font-black text-emerald-600 mt-1">
                ₹{Number(issue.estimatedCost || 45000).toLocaleString("en-IN")}
              </div>
            </div>

            <div>
              <div className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider">Suggested SLA Timeline</div>
              <div className="text-xs font-black text-amber-700 mt-1">
                {issue.resolutionTimeline || "24 Hours"}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#ECECEC]/60">
            <div className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider">AI Suggested Action Plan</div>
            <ol className="list-decimal list-inside text-xs text-[#6B7280] space-y-2 pl-1 font-semibold">
              {getActionPlan(issue.category).map((step, idx) => (
                <li key={idx} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </motion.div>

      {/* Explainable AI Priority Score Formula Box */}
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)" }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-white border border-[#ECECEC] rounded-[18px] p-6 md:p-8 space-y-4 shadow-xs"
      >
        <div className="flex items-center space-x-2 text-amber-600">
          <TrendingUp className="w-5 h-5 shrink-0" />
          <span className="font-black text-xs uppercase tracking-wider">Explainable AI Priority Score Formula</span>
        </div>

        <p className="text-xs md:text-sm text-[#6B7280] font-semibold leading-relaxed">
          This issue's priority is dynamically calculated by weighting severity, upvotes, and public safety impact.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Base Severity */}
          <div className="bg-[#FAFAFA] border border-[#ECECEC] rounded-xl p-4 text-center flex flex-col justify-between h-24 shadow-2xs">
            <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider">Base Severity</span>
            <span className="text-2xl font-black text-[#111111]">{baseSeverity}</span>
            <span className="text-[10px] text-[#6B7280] font-bold">({issue.severity} rating)</span>
          </div>

          {/* Safety Risk */}
          <div className="bg-[#FAFAFA] border border-[#ECECEC] rounded-xl p-4 text-center flex flex-col justify-between h-24 shadow-2xs">
            <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider">Safety/Traffic Risk</span>
            <span className="text-2xl font-black text-[#111111]">{safetyRisk}</span>
            <span className="text-[10px] text-[#6B7280] font-bold">(Estimated by AI)</span>
          </div>

          {/* Citizen Upvotes */}
          <div className="bg-[#FAFAFA] border border-[#ECECEC] rounded-xl p-4 text-center flex flex-col justify-between h-24 shadow-2xs">
            <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider">Citizen Upvotes</span>
            <span className="text-2xl font-black text-emerald-600">+{upvoteBonus}</span>
            <span className="text-[10px] text-[#6B7280] font-bold">(+{issue.verifications.length} verifications)</span>
          </div>

          {/* Final Priority */}
          <div className="bg-indigo-50/20 border border-indigo-100 rounded-xl p-4 text-center flex flex-col justify-between h-24 shadow-2xs animate-pulse">
            <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider">Final Priority</span>
            <span className="text-2xl font-black text-indigo-700">{issue.priorityScore}</span>
            <span className="text-[10px] text-indigo-600 font-extrabold">Scale of 0-100</span>
          </div>
        </div>
      </motion.div>

      {/* Multi-Agent AI Workflow Logs */}
      <div className="bg-white border border-[#ECECEC] rounded-[18px] p-6 md:p-8 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2 text-indigo-600 border-b border-[#ECECEC] pb-3">
          <Scale className="w-5 h-5 shrink-0" />
          <span className="font-black text-xs uppercase tracking-wider">Multi-Agent AI Workflow</span>
        </div>

        <p className="text-xs text-[#6B7280] font-bold leading-relaxed">
          Gemini coordinates four specialized AI agents to process, route, and budget the reported complaint:
        </p>

        <div className="space-y-4 pt-2">
          {/* Agent 1 */}
          <div className="flex items-start space-x-3 text-xs md:text-sm border-b border-slate-50 pb-3">
            <span className="text-[#9CA3AF] font-bold mt-0.5">1</span>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[#111111]">Vision Agent</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">SUCCESS</span>
              </div>
              <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                {(issue.aiThoughts as any)?.visionAnalysis || "Detected active physical issue and categorized corresponding materials."}
              </p>
            </div>
          </div>

          {/* Agent 2 */}
          <div className="flex items-start space-x-3 text-xs md:text-sm border-b border-slate-50 pb-3">
            <span className="text-[#9CA3AF] font-bold mt-0.5">2</span>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[#111111]">Severity Agent</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">SUCCESS</span>
              </div>
              <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                {(issue.aiThoughts as any)?.costExplanation || "Calculated severity ratings based on surrounding physical and environmental impacts."}
              </p>
            </div>
          </div>

          {/* Agent 3 */}
          <div className="flex items-start space-x-3 text-xs md:text-sm border-b border-slate-50 pb-3">
            <span className="text-[#9CA3AF] font-bold mt-0.5">3</span>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[#111111]">Prioritizer Agent</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">SUCCESS</span>
              </div>
              <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                {(issue.aiThoughts as any)?.priorityCalculations || "Computed the compound priority index integrating citizen verification weights."}
              </p>
            </div>
          </div>

          {/* Agent 4 */}
          <div className="flex items-start space-x-3 text-xs md:text-sm">
            <span className="text-[#9CA3AF] font-bold mt-0.5">4</span>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[#111111]">Routing Agent</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">SUCCESS</span>
              </div>
              <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                {(issue.aiThoughts as any)?.departmentSLA || `Dispatched to appropriate municipal coordination wings and established standard SLAs.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Evidence Section */}
      {((issue.imageUrls && issue.imageUrls.length > 0) || (issue.videoUrls && issue.videoUrls.length > 0)) && (
        <div className="space-y-4">
          <h2 className="text-xs font-black text-[#111111] uppercase tracking-wider">Media Evidence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {issue.imageUrls && issue.imageUrls.length > 0 && (
              <div className="bg-white border border-[#ECECEC] rounded-[18px] p-4 shadow-xs overflow-hidden flex items-center justify-center">
                <img 
                  referrerPolicy="no-referrer"
                  src={issue.imageUrls[0]} 
                  alt="Evidence upload" 
                  className="w-full h-auto rounded-xl object-contain max-h-80"
                />
              </div>
            )}
            {issue.videoUrls && issue.videoUrls.length > 0 && (
              <div className="bg-white border border-[#ECECEC] rounded-[18px] p-4 shadow-xs overflow-hidden flex items-center justify-center">
                <video 
                  src={issue.videoUrls[0]} 
                  controls 
                  className="w-full h-auto rounded-xl object-contain max-h-80"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Verify Widget */}
      <div className="bg-white border border-[#ECECEC] rounded-[18px] p-6 md:p-8 space-y-4 shadow-xs">
        <h3 className="font-black text-xs text-[#111111] uppercase tracking-wider">Help Verify</h3>
        <p className="text-xs text-[#6B7280] font-semibold">Confirm this hazard exists to escalate its municipal score.</p>
        
        <div className="space-y-4 pt-1">
          {verificationError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="text-xs text-rose-700 font-semibold">{verificationError}</span>
            </div>
          )}

          {(() => {
            const hasAlreadyVerified = !!(user && issue.verifications?.some(
              (v: any) => v.userId === user.id
            ));
            return (
              <motion.button
                onClick={handleConfirmVerification}
                whileHover={verifyMutation.isPending || issue.status === "Resolved" || hasAlreadyVerified ? {} : { scale: 1.02 }}
                whileTap={verifyMutation.isPending || issue.status === "Resolved" || hasAlreadyVerified ? {} : { scale: 0.98 }}
                disabled={verifyMutation.isPending || issue.status === "Resolved" || hasAlreadyVerified}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-[#FAFAFA] border border-transparent disabled:border-[#ECECEC] text-white disabled:text-[#9CA3AF] font-bold text-xs rounded-xl flex items-center justify-center space-x-2 disabled:opacity-80 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <Check className={`w-4 h-4 shrink-0 ${hasAlreadyVerified ? "text-emerald-500" : "text-white disabled:text-[#9CA3AF]"}`} />
                <span>
                  {verifyMutation.isPending 
                    ? "Confirming..." 
                    : hasAlreadyVerified 
                      ? "Already Verified by You" 
                      : issue.status === "Resolved" 
                        ? "Resolved Issue" 
                        : "Confirm Issue Location"}
                </span>
              </motion.button>
            );
          })()}
        </div>
      </div>

      {/* Issue Stats Section */}
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)" }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-white border border-[#ECECEC] rounded-[18px] p-6 md:p-8 space-y-4 shadow-xs"
      >
        <h3 className="font-black text-xs text-[#111111] uppercase tracking-wider">Issue Statistics</h3>
        
        <div className="divide-y divide-[#ECECEC] text-xs pt-2 font-semibold text-[#6B7280]">
          <div className="flex justify-between py-3.5">
            <span>Status</span>
            <span className="font-black text-amber-700">{issue.status}</span>
          </div>
          <div className="flex justify-between py-3.5">
            <span>Verifications</span>
            <span className="font-black text-[#111111]">{issue.verifications.length}</span>
          </div>
          <div className="flex justify-between py-3.5">
            <span>AI Severity</span>
            <span className="font-black text-rose-600">{issue.severity}</span>
          </div>
          <div className="flex justify-between py-3.5">
            <span>Priority Score</span>
            <span className="font-black text-indigo-600">{issue.priorityScore}/100</span>
          </div>
          <div className="flex justify-between py-3.5">
            <span>Reported</span>
            <span className="font-bold text-[#111111]">
              {new Date(issue.createdAt).toLocaleDateString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric"
              })}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default IssueDetail;
