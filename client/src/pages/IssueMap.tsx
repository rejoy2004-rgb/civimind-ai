import React, { useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc.ts";
import { Map } from "../components/Map.tsx";
import { motion } from "motion/react";
import { 
  Filter, 
  MapPin, 
  Flame, 
  Sparkles, 
  Info,
  Calendar,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

export const IssueMap: React.FC = () => {
  // Query for all issues
  const { data: issuesList, isLoading } = trpc.issues.list.useQuery();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "Road Hazards & Potholes", label: "Roads & Potholes" },
    { id: "Water & Utilities", label: "Water & Utilities" },
    { id: "Electrical & Streetlights", label: "Electrical & Power" },
    { id: "Waste & Sanitation", label: "Waste & Sanitation" },
    { id: "Parks & Public Spaces", label: "Parks & Recreation" },
    { id: "Grafitti & Vandalism", label: "Grafitti & Vandalism" },
  ];

  const statuses = [
    { id: "all", label: "All Statuses" },
    { id: "Reported", label: "Reported" },
    { id: "Verified", label: "Verified" },
    { id: "In Progress", label: "In Progress" },
    { id: "Resolved", label: "Resolved" },
  ];

  // Filtering list
  const filteredIssues = (issuesList || []).filter(issue => {
    const categoryMatch = selectedCategory === "all" || issue.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || issue.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

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
      className="space-y-6 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#ECECEC]">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#111111] tracking-tight">Interactive Issue Map</h1>
          <p className="text-xs font-semibold text-[#6B7280]">
            Real-time geolocation feed of neighborhood hazards and infrastructure triages.
          </p>
        </div>

        {/* Legend */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex flex-wrap gap-4 p-3 bg-white border border-[#ECECEC] rounded-xl text-xs font-bold text-[#6B7280] shadow-2xs cursor-default"
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
            <span>Reported</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
            <span>Verified</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span>Resolved</span>
          </div>
        </motion.div>
      </div>

      {/* Main Map Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left filter widget */}
        <motion.div 
          whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)", borderColor: "#cbd5e1" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="lg:col-span-1 bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-5 space-y-5 h-fit shadow-xs"
        >
          <div className="flex items-center space-x-2 border-b border-[#ECECEC] pb-3">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="font-extrabold text-[#111111] text-xs uppercase tracking-wider">Map Filters</h3>
          </div>

          {/* Category List */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#ECECEC] rounded-lg text-xs font-semibold text-[#111111] focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Status List */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#ECECEC] rounded-lg text-xs font-semibold text-[#111111] focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-[#ECECEC] pt-4">
            <div className="text-[10px] text-[#9CA3AF] leading-relaxed flex items-start space-x-1.5 font-medium font-semibold">
              <Info className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 mt-0.5" />
              <span>Map centered around operations grid. Toggle standard pins or thermal heatmaps on the top right.</span>
            </div>
          </div>
        </motion.div>

        {/* Right Map Canvas */}
        <motion.div 
          whileHover={{ y: -2, boxShadow: "0 10px 18px -6px rgba(0,0,0,0.04)" }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="lg:col-span-3 h-[540px] bg-white border border-[#ECECEC] rounded-[18px] overflow-hidden shadow-xs relative"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-50 bg-white/95">
              <div className="w-8 h-8 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-[11px] text-[#6B7280] font-mono font-bold">Drawing spatial nodes...</span>
            </div>
          ) : (
            <Map issues={filteredIssues} />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default IssueMap;
