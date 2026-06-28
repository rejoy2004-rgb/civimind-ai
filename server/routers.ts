import { router, publicProcedure, protectedProcedure } from "./_core/trpc.ts";
import { z } from "zod";
import { db, DBIssue, DBUser } from "./db.ts";
import { analyzeIssueWorkflow, scanIssueImage } from "./_core/issueWorkflow.ts";
import { GoogleMapsService } from "./_core/map.ts";
import { TRPCError } from "@trpc/server";
import { clearSessionCookie } from "./_core/cookies.ts";

// Helper for distance check (flat earth approximation for ~200m)
function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return r * c;
}

export const appRouter = router({
  // 1. Auth Router
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      return ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearSessionCookie(ctx.res);
      return { success: true };
    }),
    updateWeeklyDigest: publicProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Must be signed in to modify settings.",
          });
        }
        try {
          return await db.updateUserWeeklyDigest(ctx.user.id, input.enabled);
        } catch (err: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: err.message || "Failed to update settings.",
          });
        }
      }),
  }),

  // 2. Issues Router
  issues: router({
    list: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          status: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return db.getIssues(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const issue = await db.getIssueById(input.id);
        if (!issue) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Civic issue not found",
          });
        }
        const verifications = await db.getIssueVerifications(input.id);
        
        // Fetch reporter details
        let reporter: DBUser | null = null;
        try {
          reporter = await db.getUserByOpenId(issue.reporterId);
        } catch (err) {
          console.error("Failed to fetch reporter:", err);
        }

        return {
          ...issue,
          verifications,
          reporter: reporter || { id: issue.reporterId, name: "Anonymous Citizen", points: 0 }
        };
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(5).max(100),
          description: z.string().min(10).max(1000),
          latitude: z.number(),
          longitude: z.number(),
          address: z.string(),
          imageBase64: z.string().optional(),
          videoBase64: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Run AI Multi-Agent Triage Workflow
        const analysis = await analyzeIssueWorkflow(
          input.title,
          input.description,
          input.imageBase64,
          input.latitude,
          input.longitude,
          input.videoBase64
        );

        // Assemble images
        const imageUrls: string[] = [];
        if (input.imageBase64) {
          imageUrls.push(input.imageBase64);
        }

        // Assemble videos
        const videoUrls: string[] = [];
        if (input.videoBase64) {
          videoUrls.push(input.videoBase64);
        }

        // Create issue in DB
        let finalAddress = input.address;
        if (
          !finalAddress ||
          finalAddress.startsWith("GPS Lat") ||
          finalAddress.includes("Coordinates") ||
          finalAddress.includes("Lat:") ||
          finalAddress.includes("Offset:") ||
          finalAddress.includes("Coord")
        ) {
          try {
            const geoResult = await GoogleMapsService.reverseGeocode(input.latitude, input.longitude);
            if (geoResult && geoResult.address) {
              finalAddress = geoResult.address;
            }
          } catch (e) {
            console.error("Backend geocode validation failed:", e);
          }
        }

        const newIssue = await db.createIssue({
          reporterId: ctx.user.id,
          title: input.title,
          description: input.description,
          status: "Reported",
          category: analysis.category,
          severity: analysis.severity,
          priorityScore: analysis.priorityScore,
          assignedDepartment: analysis.assignedDepartment,
          estimatedCost: analysis.estimatedCost,
          resolutionTimeline: analysis.resolutionTimeline,
          latitude: input.latitude,
          longitude: input.longitude,
          address: finalAddress,
          imageUrls,
          videoUrls,
          aiThoughts: analysis.aiThoughts
        });

        return newIssue;
      }),

    stats: publicProcedure.query(async () => {
      return db.getIssueStats();
    }),

    scanImage: publicProcedure
      .input(
        z.object({
          imageBase64: z.string(),
          fileName: z.string().optional(),
          isVideo: z.boolean().optional()
        })
      )
      .mutation(async ({ input }) => {
        try {
          const scanResult = await scanIssueImage(input.imageBase64, input.fileName, input.isVideo);
          return scanResult;
        } catch (err: any) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err.message || "Failed to scan image",
          });
        }
      }),

    checkDuplicates: publicProcedure
      .input(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
        })
      )
      .query(async ({ input }) => {
        const issuesList = await db.getIssues();
        const duplicates = issuesList.filter(issue => {
          const distance = calculateDistanceInMeters(
            input.latitude,
            input.longitude,
            Number(issue.latitude),
            Number(issue.longitude)
          );
          // Return issues within 200m that are NOT resolved
          return distance <= 200 && issue.status !== "Resolved";
        });

        return duplicates;
      }),

    acknowledge: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const updated = await db.acknowledgeIssue(input.id);
          return updated;
        } catch (err: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: err.message || "Failed to acknowledge issue",
          });
        }
      }),
  }),

  // 3. Verification Router
  verification: router({
    verify: protectedProcedure
      .input(
        z.object({
          issueId: z.string(),
          comment: z.string().max(300).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await db.verifyIssue(input.issueId, ctx.user.id, input.comment);
          return result;
        } catch (err: any) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: err.message || "Failed to verify issue",
          });
        }
      }),
  }),

  // 4. Gamification Router
  gamification: router({
    getProfile: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        const user = await db.getUserByOpenId(input.userId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        const badges = await db.getUserBadges(input.userId);
        return {
          ...user,
          badges,
          level: Math.floor(user.points / 150) + 1,
          nextLevelPoints: (Math.floor(user.points / 150) + 1) * 150,
        };
      }),

    getLeaderboard: publicProcedure.query(async () => {
      return db.getLeaderboard();
    }),
  }),

  // 5. Google Maps Platform SDK proxy Router
  maps: router({
    geocode: publicProcedure
      .input(z.object({ address: z.string() }))
      .query(async ({ input }) => {
        return GoogleMapsService.geocode(input.address);
      }),

    reverseGeocode: publicProcedure
      .input(z.object({ latitude: z.number(), longitude: z.number() }))
      .mutation(async ({ input }) => {
        return GoogleMapsService.reverseGeocode(input.latitude, input.longitude);
      }),

    autocomplete: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return GoogleMapsService.autocomplete(input.query);
      }),
  }),
});

export type AppRouter = typeof appRouter;
