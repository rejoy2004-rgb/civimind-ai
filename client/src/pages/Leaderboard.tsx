import React, { useState } from "react";
import { trpc } from "../lib/trpc.ts";
import { motion } from "motion/react";
import { 
  Trophy, 
  Award, 
  Flame, 
  User, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck,
  Calendar,
  X
} from "lucide-react";

export const Leaderboard: React.FC = () => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Queries
  const { data: leaderboard, isLoading } = trpc.gamification.getLeaderboard.useQuery();
  const { data: profile } = trpc.gamification.getProfile.useQuery({
    userId: selectedProfileId || ""
  }, {
    enabled: !!selectedProfileId
  });

  const getRankBadgeStyle = (index: number) => {
    if (index === 0) return "bg-amber-50 text-amber-700 border-amber-200";
    if (index === 1) return "bg-slate-50 text-slate-700 border-slate-200";
    if (index === 2) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-slate-50 text-slate-500 border-[#ECECEC]";
  };

  const getFriendlyBadgeName = (type: string) => {
    const map: Record<string, string> = {
      first_reporter: "First Reporter",
      verified_hero: "Verified Hero",
      civic_champion: "Civic Champion"
    };
    return map[type] || "Civic Achiever";
  };

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
        <h1 className="text-2xl md:text-3xl font-black text-[#111111] tracking-tight">Civic Leaderboard</h1>
        <p className="text-xs font-semibold text-[#6B7280]">
          Rankings of dedicated citizen heroes keeping physical infrastructure safe and validated.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Leaderboard Table Column */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div 
            whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="bg-white border border-[#ECECEC] rounded-[18px] overflow-hidden shadow-xs"
          >
            <div className="p-5 border-b border-[#ECECEC] flex items-center justify-between bg-[#FAFAFA]">
              <h3 className="font-extrabold text-[#111111] text-xs uppercase tracking-wider flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Active Rank list</span>
              </h3>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <div className="w-6 h-6 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="text-[11px] text-[#6B7280] font-mono font-bold">Loading leaderboard...</span>
              </div>
            ) : leaderboard && leaderboard.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#6B7280] font-semibold">
                No users have logged points. Submit or upvote reports to take the lead!
              </div>
            ) : (
              <div className="divide-y divide-[#ECECEC]">
                {leaderboard?.map((leader, index) => {
                  const level = Math.floor(leader.points / 150) + 1;
                  return (
                    <motion.div
                      key={leader.id}
                      onClick={() => setSelectedProfileId(leader.userId)}
                      whileHover={{ x: 4, backgroundColor: "rgba(241, 245, 249, 0.3)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="p-4 flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Rank index */}
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${getRankBadgeStyle(index)}`}>
                          {index + 1}
                        </div>

                        {/* User Avatar & Name */}
                        <div className="flex items-center space-x-3">
                          {leader.userAvatarUrl ? (
                            <img
                              src={leader.userAvatarUrl}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-[#ECECEC]"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] border border-[#ECECEC] flex items-center justify-center text-[#111111] font-bold text-sm">
                              {leader.userName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-[#111111] flex items-center space-x-2">
                              <span>{leader.userName}</span>
                              {index === 0 && <span className="inline-flex px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 rounded">Top Hero</span>}
                            </div>
                            <div className="text-[10px] text-[#6B7280] font-medium">
                              Level {level} Active Citizen
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Points / XP Total */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-[#FAFAFA] border border-[#ECECEC] rounded-full">
                          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                          <span className="text-[11px] font-extrabold text-[#111111]">{leader.points} XP</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-slate-800 transition-colors shrink-0" />
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Selected Profile Detail Popup Panel */}
        <div className="lg:col-span-1">
          {profile ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-[#ECECEC] rounded-[18px] p-6 shadow-xs space-y-6 relative"
            >
              <button
                onClick={() => setSelectedProfileId(null)}
                className="absolute top-4 right-4 p-1.5 text-[#9CA3AF] hover:text-[#111111] hover:bg-[#FAFAFA] rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-3 pt-4 border-b border-[#ECECEC] pb-5">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 mx-auto shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl mx-auto shadow-xs">
                    {profile.name.charAt(0)}
                  </div>
                )}
                
                <div>
                  <h3 className="font-extrabold text-[#111111] text-sm leading-none">{profile.name}</h3>
                  <p className="text-[10px] text-[#6B7280] font-semibold mt-1 font-mono">{profile.email}</p>
                </div>

                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-600 animate-pulse" />
                  <span className="text-[10px] font-black text-orange-700">Level {profile.level}</span>
                </div>
              </div>

              {/* Progress Bar to Next Level */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] text-[#6B7280] font-extrabold tracking-wider">
                  <span>LEVEL PROGRESS</span>
                  <span>{profile.points} / {profile.nextLevelPoints} XP</span>
                </div>
                <div className="w-full h-2 bg-[#FAFAFA] border border-[#ECECEC] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((profile.points / profile.nextLevelPoints) * 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-indigo-600 rounded-full"
                  ></motion.div>
                </div>
              </div>

              {/* Badges Earned Container */}
              <div className="space-y-3">
                <div className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Earned Achievement Badges ({profile.badges.length})
                </div>

                {profile.badges.length === 0 ? (
                  <div className="p-4 bg-[#FAFAFA] border border-[#ECECEC] rounded-xl text-center text-xs text-[#9CA3AF] font-medium">
                    No badges unlocked yet. Continue reporting and verifying physical hazards to claim awards!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {profile.badges.map((b) => (
                      <div key={b.id} className="p-3 bg-[#FAFAFA] border border-[#ECECEC] rounded-xl flex items-center space-x-2.5">
                        <div className="p-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg shrink-0">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-black text-[#111111] truncate">{getFriendlyBadgeName(b.badgeType)}</div>
                          <div className="text-[8px] text-[#9CA3AF] font-bold truncate">{new Date(b.awardedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Citizen metrics */}
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#ECECEC] grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-black text-[#111111]">{profile.totalIssuesReported}</div>
                  <div className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">Filed Reports</div>
                </div>
                <div>
                  <div className="text-lg font-black text-[#111111]">{profile.totalVerifications}</div>
                  <div className="text-[9px] text-[#6B7280] uppercase font-bold tracking-wider">Verifications</div>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#ECECEC] rounded-[18px] p-6 text-center space-y-3 shadow-xs h-48 flex flex-col justify-center"
            >
              <User className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-[#111111]">Hero profile inspector</div>
              <p className="text-[10px] text-[#6B7280] max-w-xs mx-auto leading-relaxed font-semibold">
                Click on any rank profile in the ranking leaderboard to inspect their level progress and claims!
              </p>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Leaderboard;
