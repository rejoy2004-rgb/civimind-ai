import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../_core/hooks/useAuth.ts";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home as HomeIcon,
  FileText,
  MapPin, 
  BarChart3, 
  Sparkles, 
  Trophy, 
  LogOut, 
  Menu, 
  X,
  Award,
  Building2
} from "lucide-react";

export const Navigation: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return null; // Only show navigation for authenticated users

  const navItems = [
    { href: "/home", label: "Home", icon: HomeIcon },
    { href: "/report", label: "Report Issue", icon: FileText },
    { href: "/map", label: "Map", icon: MapPin },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/insights", label: "AI Insights", icon: Sparkles },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/operations", label: "Operations", icon: Building2 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#ECECEC] transition-all">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand matching CiviMind AI */}
          <div className="flex items-center space-x-3">
            <Link href="/home" className="flex items-center space-x-2.5">
              <div className="flex items-center -space-x-1 shrink-0">
                <div className="w-5.5 h-5.5 rounded-md bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">C</div>
                <div className="w-5.5 h-5.5 rounded-md bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black">M</div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#111111]">
                Civi<span className="text-indigo-600">Mind</span>
                <span className="font-black text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-1.5 py-0.5 rounded ml-1.5 uppercase tracking-wider relative -top-0.5">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Menu (Center) */}
          <div className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-[#6B7280]">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2.5 px-1 text-sm font-bold transition-colors hover:text-[#111111] cursor-pointer ${
                    isActive 
                      ? "text-[#111111] font-black" 
                      : "text-[#6B7280]"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.span 
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-indigo-600 rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Gamification & Actions (Right) */}
          <div className="hidden lg:flex items-center space-x-5">
            {/* User Profile Info */}
            <div className="flex items-center space-x-3.5 border-l border-[#ECECEC] pl-5">
              <div className="text-right">
                <div className="text-xs font-bold text-[#111111]">
                  {user.name}
                </div>
                <div className="mt-1 flex items-center space-x-1 px-2.5 py-0.5 bg-amber-50 border border-amber-100 rounded-full">
                  <Award className="w-3 h-3 text-amber-600" />
                  <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                    {user.points} pts
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-500 hover:text-[#111111] hover:bg-[#FAFAFA] rounded-lg focus:outline-none transition-all cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-t border-[#ECECEC] bg-white px-6 pt-3 pb-6 space-y-3 shadow-md overflow-hidden"
          >
            {/* Mobile Gamification Bar */}
            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] border border-[#ECECEC] rounded-2xl mb-2">
              <div>
                <div className="text-xs font-bold text-[#111111]">{user.name}</div>
                <div className="text-[10px] text-[#6B7280] font-semibold">{user.email}</div>
              </div>
              <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-extrabold text-amber-700 uppercase">{user.points} PTS</span>
              </div>
            </div>

            {/* Nav Items */}
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-indigo-50 border border-indigo-100/50 text-indigo-600"
                      : "text-[#6B7280] hover:text-[#111111] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={logout}
              className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
