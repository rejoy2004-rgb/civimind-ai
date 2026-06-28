import { Request, Response } from "express";
import { getSessionFromRequest } from "./cookies.ts";
import { db, DBUser } from "../db.ts";

export interface Context {
  user: DBUser | null;
  req: Request;
  res: Response;
}

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  const userId = getSessionFromRequest(req);
  let user: DBUser | null = null;

  if (userId) {
    try {
      user = await db.getUserByOpenId(userId);
    } catch (err) {
      console.error("Failed to fetch user in tRPC context:", err);
    }
  }

  return {
    user,
    req,
    res
  };
}
