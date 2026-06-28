import { Response, Request } from "express";
import { SESSION_COOKIE_NAME } from "../../shared/const.ts";

export const COOKIE_SECRET = "super_secret_community_hero_token_key";

export function setSessionCookie(res: Response, userId: string) {
  res.cookie(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 3600 * 1000, // 7 days
    signed: true,
  });
}

export function getSessionFromRequest(req: Request): string | null {
  // Use signed cookies if secret is set
  const signedSession = req.signedCookies?.[SESSION_COOKIE_NAME];
  if (signedSession) return signedSession;

  // Fallback to normal cookies if unsigned during local development
  return req.cookies?.[SESSION_COOKIE_NAME] || null;
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
}
