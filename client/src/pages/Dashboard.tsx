import React, { useState, useEffect } from "react";
import { trpc } from "../lib/trpc.ts";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  Trophy, 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Activity,
  AlertCircle,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

interface RiskPrediction {
  area: string;
  riskType: string;
  probability: number;
  remedy: string;
}

interface AIInsightsPayload {
  summary: string;
  predictions: RiskPrediction[];
  recommendations: string[];
}

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = trpc.issues.stats.useQuery();
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  useEffect(() => {
    fetch("/api/predictive-insights")
      .then(res => res.json())
      .then((data: AIInsightsPayload) => {
        if (data && data.predictions) {
          setPredictions(data.predictions);
        }
      })
      .catch(err => console.error("Dashboard failed to fetch predictions:", err))
      .finally(() => setLoadingPredictions(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-white border border-[#ECECEC] rounded-[18px] p-12">
        <div className="w-8 h-8 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-[11px] text-[#6B7280] font-mono font-bold">Loading city operations stats...</span>
      </div>
    );
  }

  if (!stats) return null;

  // Transform Category Breakdown for PieChart
  const pieData = Object.entries(stats.categoryBreakdown).map(([name, value]) => ({
    name: name.replace(" & ", "\n& "),
    value
  }));

  // Status breakdown for BarChart
  const statusData = [
    { name: "Reported", count: stats.reported, fill: "#0284c7" },
    { name: "Verified", count: stats.verified, fill: "#7c3aed" },
    { name: "In Progress", count: stats.inProgress, fill: "#d97706" },
    { name: "Resolved", count: stats.resolved, fill: "#059669" }
  ];

  // Severity breakdown data
  const severityData = Object.entries(stats.severityBreakdown).map(([name, value]) => ({
    name,
    count: value
  }));

  const COLORS = ["#4f46e5", "#7c3aed", "#db2777", "#d97706", "#059669", "#0284c7", "#0d9488"];

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
      className="space-y-8 pb-20"
    >
      <div className="space-y-1.5 text-left pb-4 border-b border-[#ECECEC]">
        <h1 className="text-2xl md:text-3xl font-black text-[#111111] tracking-tight">City Triage Analytics</h1>
        <p className="text-xs font-semibold text-[#6B7280]">
          Live statistics of reported issues, SLA progression times, and department budget allocations.
        </p>
      </div>

      {/* Grid of high fidelity analytics cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Share - Pie Chart */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)", borderColor: "#cbd5e1" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 shadow-xs space-y-4 col-span-1"
        >
          <div className="flex items-center space-x-2 border-b border-[#ECECEC] pb-3">
            <PieIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-[#111111] text-xs uppercase tracking-wider">Issue Distribution Share</h3>
          </div>
          
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ECECEC", borderRadius: "8px" }}
                  itemStyle={{ color: "#111111", fontSize: "11px", fontWeight: "600" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-[#111111]">{stats.total}</span>
              <span className="text-[9px] text-[#6B7280] font-black uppercase tracking-wider">Incidents</span>
            </div>
          </div>

          {/* Simple custom legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#6B7280] font-semibold">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="truncate">{item.name.replace("\n", "")} ({item.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Status Pipeline - Bar Chart */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)", borderColor: "#cbd5e1" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 shadow-xs space-y-4 col-span-1 lg:col-span-2"
        >
          <div className="flex items-center space-x-2 border-b border-[#ECECEC] pb-3">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-[#111111] text-xs uppercase tracking-wider">SLA Status Pipelines</h3>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  fontWeight="600"
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  fontWeight="600"
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ECECEC", borderRadius: "8px" }}
                  labelStyle={{ color: "#6B7280", fontSize: "10px", fontWeight: "700" }}
                  itemStyle={{ color: "#111111", fontSize: "11px", fontWeight: "600" }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Row 2 splits: Severity distribution & City Health Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Severity Metrics */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)", borderColor: "#cbd5e1" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center space-x-2 border-b border-[#ECECEC] pb-3">
            <Activity className="w-4 h-4 text-rose-500" />
            <h3 className="font-extrabold text-[#111111] text-xs uppercase tracking-wider">Severity Load Density</h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} fontWeight="600" />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} fontWeight="600" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ECECEC", borderRadius: "8px" }}
                  itemStyle={{ color: "#111111", fontSize: "11px", fontWeight: "600" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f43f5e" 
                  fill="rgba(244, 63, 94, 0.05)" 
                  strokeWidth={2} 
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live operational logs */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)", borderColor: "#cbd5e1" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 shadow-xs space-y-4 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2 border-b border-[#ECECEC] pb-3">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-[#111111] text-xs uppercase tracking-wider">Citizen Civic Efficiency Index</h3>
            </div>
            
            <div className="py-6 text-center space-y-2">
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {stats.total > 0 ? Math.round(((stats.resolved + stats.verified) / stats.total) * 100) : 100}%
              </div>
              <p className="text-[10px] text-[#6B7280] font-black uppercase tracking-wider">
                Actionable Dispatch Index (ADI)
              </p>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed font-semibold">
                The percentage of reported issues that have been either validated by user consensus or actively pushed into active department SLA resolutions. Higher indices correlate to less municipal waste.
              </p>
            </div>
          </div>

          <div className="bg-[#FAFAFA] p-3.5 rounded-xl border border-[#ECECEC] flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#6B7280] leading-normal leading-relaxed font-semibold">
              Consensus upvoting filters trivial complaints, allowing contractors and municipal technicians to directly dispatch high-impact assets immediately.
            </p>
          </div>
        </motion.div>
      </div>

      {/* AI Spatial Intelligence & Ward Risk Forecast Panel */}
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 10px 18px -6px rgba(0,0,0,0.04)" }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="bg-white border border-[#ECECEC] rounded-[18px] p-6 md:p-8 space-y-6 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECECEC] pb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl shrink-0">
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-[#111111] text-xs uppercase tracking-wider">
                  AI Ward Risk Forecast (Spatial Intelligence)
                </h3>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] font-extrabold rounded-full uppercase">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Real-time models</span>
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] font-semibold mt-0.5">
                Proactive monitoring using aggregate citizen telemetry to alert on upcoming civil risks.
              </p>
            </div>
          </div>
        </div>

        {loadingPredictions ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="w-6 h-6 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
            <span className="text-[10px] text-[#6B7280] font-mono font-bold">Consulting predictive spatial models...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Spotlight Critical Alert Banner for Indiranagar */}
            {predictions.some(p => p.area.includes("Indiranagar")) && (
              <div className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">🚨</span>
                  <div>
                    <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider">Critical Ward Risk Spike</h4>
                    <p className="text-xs text-rose-700 font-semibold leading-relaxed mt-0.5">
                      Based on 14 water leakage reports in Indiranagar over 3 months, flood risk this week is calculated as <span className="underline decoration-wavy font-black">HIGH</span>. Preventative stormwater drainage cleaning is recommended.
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider animate-pulse">
                    92% Probability
                  </span>
                </div>
              </div>
            )}

            {/* Grid of regional predictions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {predictions.slice(0, 3).map((p, idx) => {
                const isIndiranagar = p.area.includes("Indiranagar");
                const isHigh = p.probability >= 80;

                return (
                  <div
                    key={idx}
                    className={`border rounded-xl p-4.5 space-y-3 transition-colors ${
                      isIndiranagar 
                        ? "border-rose-200 bg-rose-50/10" 
                        : isHigh 
                        ? "border-amber-200 bg-amber-50/10" 
                        : "border-[#ECECEC] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#111111] uppercase tracking-wider truncate max-w-[150px]">
                        {p.area}
                      </span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        isIndiranagar ? "bg-rose-100 text-rose-700 font-black" : isHigh ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.probability}% Risk
                      </span>
                    </div>

                    <div>
                      <div className="text-[8px] text-[#9CA3AF] font-bold uppercase mb-0.5 tracking-wider">Forecasted Failure</div>
                      <div className="text-xs font-bold text-slate-800">{p.riskType}</div>
                    </div>

                    {/* Progress slider bar */}
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isIndiranagar ? "bg-rose-500" : isHigh ? "bg-amber-500" : "bg-indigo-500"}`}
                        style={{ width: `${p.probability}%` }}
                      ></div>
                    </div>

                    <div className="bg-[#FAFAFA] p-2.5 rounded-lg border border-[#ECECEC] text-[10px] text-[#6B7280] font-semibold flex items-start space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{p.remedy}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
