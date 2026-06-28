import React from "react";
import { Link } from "wouter";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-6">
      <div className="p-4 bg-rose-50 text-rose-600 rounded-[18px] border border-rose-100 animate-bounce">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-black text-[#111111] tracking-tight">404 - Grid Segment Not Located</h1>
        <p className="text-xs text-[#6B7280] max-w-sm leading-relaxed font-semibold">
          The requested coordinate intersection or portal view does not exist in the CiviMind central index.
        </p>
      </div>
      <Link href="/home">
        <button className="px-5 py-2.5 bg-[#111111] hover:bg-slate-800 text-white rounded-full text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to CiviMind Hub</span>
        </button>
      </Link>
    </div>
  );
};
export default NotFound;
