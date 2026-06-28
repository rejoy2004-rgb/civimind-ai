import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context.ts";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to access this feature.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Coerces user to be non-nullable for protected procedures
    },
  });
});
