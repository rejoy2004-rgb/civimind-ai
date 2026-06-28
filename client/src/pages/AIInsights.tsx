import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Lightbulb, 
  RefreshCw 
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

export const AIInsights: React.FC = () => {
  const [data, setData] = useState<AIInsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/predictive-insights");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch predictive insights:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 bg-white border border-[#ECECEC] rounded-[18px] p-12">
        <div className="w-8 h-8 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-[11px] text-[#6B7280] font-mono font-bold">Consulting Predictive Analytics Models...</span>
      </div>
    );
  }

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

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  } as const;

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-[1100px] mx-auto space-y-8 pb-20"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ECECEC]">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#111111] tracking-tight">AI Predictive Insights</h1>
          <p className="text-xs font-semibold text-[#6B7280]">
            Spatial hazard forecasting and preventative municipal recommendation models.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchInsights}
          disabled={refreshing}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-[#ECECEC] text-xs font-bold text-[#111111] rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Re-modeling..." : "Re-run Spatial Forecasts"}</span>
        </button>
      </div>

      {data && (
        <div className="space-y-8">
          
          {/* Executive Overview Summary Card */}
          <motion.div 
            whileHover={{ y: -2, boxShadow: "0 10px 18px -6px rgba(0,0,0,0.04)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-[#ECECEC] rounded-[18px] p-6 md:p-8 space-y-4 shadow-xs relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-indigo-600 shrink-0 pointer-events-none">
              <BrainCircuit className="w-48 h-48" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>Executive CDO Data Analysis</span>
              </div>
              <h2 className="text-base font-black text-[#111111]">Spatial Operations Forecast Summary</h2>
            </div>
            
            <p className="text-xs md:text-sm text-[#6B7280] leading-relaxed max-w-3xl font-medium">
              {data.summary}
            </p>
          </motion.div>

          {/* Spatial Risks Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-[#111111] uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Spatial Risk Predictions (7-Day Forecast)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.predictions.map((p, idx) => {
                const isIndiranagar = p.area.includes("Indiranagar");
                const isHighRisk = p.probability >= 80;
                
                return (
                  <motion.div 
                    key={idx} 
                    whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.04)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`bg-white border rounded-[18px] p-5 space-y-4 shadow-2xs flex flex-col justify-between transition-colors duration-300 ${
                      isIndiranagar 
                        ? "border-rose-400 bg-rose-50/20" 
                        : isHighRisk 
                        ? "border-amber-400 bg-amber-50/10" 
                        : "border-[#ECECEC] hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#111111] uppercase tracking-wider truncate max-w-[170px]">{p.area}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          isIndiranagar
                            ? "bg-rose-500 text-white animate-pulse"
                            : isHighRisk
                            ? "bg-amber-500 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {p.probability}% Prob
                        </span>
                      </div>
                      
                      <div>
                        <div className="text-[9px] text-[#9CA3AF] font-bold uppercase mb-0.5 tracking-wider">Potential Fail Point</div>
                        <div className="text-xs font-black text-slate-800">{p.riskType}</div>
                      </div>

                      {isIndiranagar && (
                        <div className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-700 p-2.5 rounded-xl font-bold font-sans">
                          ⚠️ Based on 14 water leakage reports in Indiranagar over 3 months, flood risk this week: <span className="underline decoration-wavy">HIGH</span>.
                        </div>
                      )}
                    </div>

                    {/* Visual gauge meter bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-[#FAFAFA] border border-[#ECECEC] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${p.probability}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            isIndiranagar ? "bg-rose-500" : isHighRisk ? "bg-amber-500" : "bg-indigo-500"
                          }`}
                        ></motion.div>
                      </div>
                    </div>

                    {/* Proposed remedy */}
                    <div className="bg-[#FAFAFA] p-3.5 border border-[#ECECEC] rounded-xl mt-2">
                      <div className="text-[9px] text-indigo-600 font-extrabold uppercase flex items-center space-x-1 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Preventative Remedy Plan</span>
                      </div>
                      <p className="text-[11px] text-[#6B7280] leading-relaxed font-semibold">{p.remedy}</p>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Actionable Budgeting & Zoning recommendations */}
          <motion.div 
            whileHover={{ y: -2, boxShadow: "0 10px 18px -6px rgba(0,0,0,0.04)", borderColor: "#cbd5e1" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 md:p-8 space-y-4 shadow-2xs"
          >
            <h3 className="font-black text-[#111111] text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-[#ECECEC] pb-4">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>Recommended Preventative Infrastructure Decisions</span>
            </h3>

            <div className="space-y-4">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 text-xs md:text-sm">
                  <div className="p-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[#6B7280] leading-relaxed font-semibold">{rec}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      )}
    </motion.div>
  );
};

export default AIInsights;
