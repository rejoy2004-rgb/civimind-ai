import { mysqlTable, varchar, int, decimal, json, timestamp, text } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  points: int("points").default(0).notNull(),
  totalIssuesReported: int("total_issues_reported").default(0).notNull(),
  totalVerifications: int("total_verifications").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Issues table
export const issues = mysqlTable("issues", {
  id: varchar("id", { length: 255 }).primaryKey(),
  reporterId: varchar("reporter_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).default("Reported").notNull(), // Reported, Verified, In Progress, Resolved
  category: varchar("category", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 50 }).default("Medium").notNull(), // Low, Medium, High, Critical
  priorityScore: int("priority_score").default(0).notNull(), // 0-100
  assignedDepartment: varchar("assigned_department", { length: 255 }),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  resolutionTimeline: varchar("resolution_timeline", { length: 100 }), // Department SLA timeline (e.g. "48 hours")
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  address: varchar("address", { length: 255 }),
  imageUrls: json("image_urls").$type<string[]>().default([]).notNull(),
  videoUrls: json("video_urls").$type<string[]>().default([]).notNull(),
  aiThoughts: json("ai_thoughts").$type<{
    visionAnalysis?: string;
    departmentSLA?: string;
    priorityCalculations?: string;
    costExplanation?: string;
    agentDecisions?: Record<string, any>;
  }>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Verifications table
export const verifications = mysqlTable("verifications", {
  id: varchar("id", { length: 255 }).primaryKey(),
  issueId: varchar("issue_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Badges table
export const userBadges = mysqlTable("user_badges", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  badgeType: varchar("badge_type", { length: 100 }).notNull(), // first_reporter, verified_hero, civic_champion, resolution_master
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

// Leaderboard snapshots table
export const leaderboard = mysqlTable("leaderboard", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  userAvatarUrl: varchar("user_avatar_url", { length: 255 }),
  points: int("points").notNull(),
  rank: int("rank").notNull(),
  activitySummary: text("activity_summary"),
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
});

// Define relations for drizzle
export const usersRelations = relations(users, ({ many }) => ({
  issues: many(issues),
  verifications: many(verifications),
  badges: many(userBadges),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  reporter: one(users, {
    fields: [issues.reporterId],
    references: [users.id],
  }),
  verifications: many(verifications),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  issue: one(issues, {
    fields: [verifications.issueId],
    references: [issues.id],
  }),
  user: one(users, {
    fields: [verifications.userId],
    references: [users.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
}));
