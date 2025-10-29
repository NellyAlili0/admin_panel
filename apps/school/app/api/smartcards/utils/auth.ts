import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24,
};

export interface TokenData {
  access_token: string;
  expires_at: string;
}

export async function authenticateAndGetToken(
  email: string,
  password: string
): Promise<TokenData> {
  const res = await fetch("https://api.terrasofthq.com/api/auth/access-token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error(`Auth failed: ${res.statusText}`);
  const data = await res.json();

  return {
    access_token: data.data.access_token,
    expires_at: data.data.expires_at,
  };
}

export async function getTokenFromCookies(): Promise<TokenData | null> {
  const store = await cookies();
  const token = store.get("terrasoft_token");
  const expires = store.get("terrasoft_expires");
  if (!token?.value || !expires?.value) return null;
  return { access_token: token.value, expires_at: expires.value };
}

export function setTokenCookies(res: NextResponse, tokenData: TokenData) {
  res.cookies.set("terrasoft_token", tokenData.access_token, COOKIE_OPTIONS);
  res.cookies.set("terrasoft_expires", tokenData.expires_at, COOKIE_OPTIONS);
}

function isTokenExpired(expiresAt: string): boolean {
  const exp = new Date(expiresAt).getTime();
  const now = Date.now();
  const buffer = 5 * 60 * 1000;
  return now >= exp - buffer;
}

export async function getValidToken(email: string, password: string) {
  const existing = await getTokenFromCookies();
  if (existing && !isTokenExpired(existing.expires_at)) {
    return { token: existing.access_token, tokenData: existing };
  }
  const tokenData = await authenticateAndGetToken(email, password);
  return { token: tokenData.access_token, tokenData };
}
