export const SESSION_COOKIE_NAME = "community_hero_session";

export const BADGE_TYPES = {
  FIRST_REPORTER: {
    id: "first_reporter",
    name: "First Reporter",
    description: "Reported your first civic issue",
    icon: "Megaphone",
    color: "from-blue-500 to-cyan-500"
  },
  VERIFIED_HERO: {
    id: "verified_hero",
    name: "Verified Hero",
    description: "Verified 5 issues reported by others",
    icon: "ShieldAlert",
    color: "from-purple-500 to-indigo-500"
  },
  CIVIC_CHAMPION: {
    id: "civic_champion",
    name: "Civic Champion",
    description: "Earned over 500 total points in the community",
    icon: "Crown",
    color: "from-amber-500 to-orange-500"
  },
  RESOLUTION_MASTER: {
    id: "resolution_master",
    name: "Resolution Master",
    description: "Successfully resolved an issue with municipal coordination",
    icon: "CheckCircle",
    color: "from-emerald-500 to-teal-500"
  }
} as const;

export const ISSUE_STATUSES = {
  REPORTED: "Reported",
  VERIFIED: "Verified",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved"
} as const;

export const ISSUE_SEVERITIES = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical"
} as const;
