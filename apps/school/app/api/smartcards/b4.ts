import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours
};

interface TokenData {
  access_token: string;
  expires_at: string;
}

interface LoginResponse {
  status: number;
  data: {
    access_token: string;
    token_type: string;
    expires_at: string;
  };
  message: string;
}

async function authenticateAndGetToken(
  email: string,
  password: string
): Promise<TokenData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // Increased to 30s

    const loginRes = await fetch(
      "https://api.terrasofthq.com/api/auth/access-token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!loginRes.ok) {
      const text = await loginRes.text();
      throw new Error(`Login failed: ${loginRes.status} ${text}`);
    }

    const loginData: LoginResponse = await loginRes.json();
    const token = loginData.data.access_token;
    const expiresAt = loginData.data.expires_at;

    if (!token) {
      throw new Error("No access_token in login response");
    }

    console.log("New token obtained, expires at:", expiresAt);
    return {
      access_token: token,
      expires_at: expiresAt,
    };
  } catch (error: any) {
    console.error("Authentication failed:", error);
    if (error.name === "AbortError") {
      throw new Error("Authentication request timed out after 30 seconds");
    }
    throw error;
  }
}

function isTokenExpired(expiresAt: string): boolean {
  const expiration = new Date(expiresAt);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  return now.getTime() >= expiration.getTime() - bufferTime;
}

async function getTokenFromCookies(): Promise<TokenData | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("terrasoft_token");
    const expiresCookie = cookieStore.get("terrasoft_expires");

    if (!tokenCookie?.value || !expiresCookie?.value) {
      return null;
    }

    return {
      access_token: tokenCookie.value,
      expires_at: expiresCookie.value,
    };
  } catch (error) {
    console.error("Error reading token from cookies:", error);
    return null;
  }
}

function setTokenCookies(response: NextResponse, tokenData: TokenData): void {
  response.cookies.set(
    "terrasoft_token",
    tokenData.access_token,
    COOKIE_OPTIONS
  );
  response.cookies.set(
    "terrasoft_expires",
    tokenData.expires_at,
    COOKIE_OPTIONS
  );
}

function clearTokenCookies(response: NextResponse): void {
  response.cookies.delete("terrasoft_token");
  response.cookies.delete("terrasoft_expires");
}

async function getValidToken(
  email: string,
  password: string
): Promise<{ token: string; tokenData: TokenData }> {
  const existingToken = await getTokenFromCookies();

  if (existingToken && !isTokenExpired(existingToken.expires_at)) {
    console.log("Using existing valid token from cookies");
    return {
      token: existingToken.access_token,
      tokenData: existingToken,
    };
  }

  console.log("Token expired or missing, getting new token");
  const tokenData = await authenticateAndGetToken(email, password);

  return {
    token: tokenData.access_token,
    tokenData,
  };
}

async function makeAuthenticatedRequest(
  url: string,
  token: string,
  options: RequestInit = {},
  retries = 4,
  timeoutMs = 60000
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok && res.status >= 500 && attempt < retries) {
        console.warn(
          `Retrying ${url}, attempt ${attempt + 1} due to ${res.status}`
        );
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }

      return res;
    } catch (err: any) {
      clearTimeout(timeout);
      if (
        attempt < retries &&
        (err.name === "AbortError" ||
          err.code === "ECONNRESET" ||
          err.code === "ETIMEDOUT")
      ) {
        console.warn(
          `Retrying ${url} after ${err.message || err.code}, attempt ${attempt + 1}`
        );
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); // Exponential backoff
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts`);
}

export async function POST(req: NextRequest) {
  const response = new NextResponse();

  try {
    // Add error handling for empty body
    let body;
    try {
      const text = await req.text();
      if (!text || text.trim() === "") {
        return NextResponse.json(
          { error: "Request body is empty" },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password, page = 1, tag } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!tag) {
      return NextResponse.json(
        { error: "Tag ID is required" },
        { status: 400 }
      );
    }

    // Get a valid token (will authenticate if needed)
    const { token, tokenData } = await getValidToken(email, password);

    // Set/update the token cookies
    setTokenCookies(response, tokenData);

    // Make the API request
    const logRes = await makeAuthenticatedRequest(
      `https://api.terrasofthq.com/api/access-log?page=${page}&tags[]=${tag}`,
      token
    );

    if (!logRes.ok) {
      // If we get a 401, the token might be invalid, try to refresh
      if (logRes.status === 401) {
        console.log("Got 401, token might be invalid, trying to refresh");

        clearTokenCookies(response);
        const newTokenData = await authenticateAndGetToken(email, password);
        setTokenCookies(response, newTokenData);

        // Retry the request with new token
        const retryRes = await makeAuthenticatedRequest(
          `https://api.terrasofthq.com/api/access-log?page=${page}&tags[]=${tag}`,
          newTokenData.access_token
        );

        if (!retryRes.ok) {
          const text = await retryRes.text();
          return NextResponse.json(
            {
              error: `Failed to fetch access-log after retry: ${retryRes.status} ${text}`,
            },
            { status: retryRes.status }
          );
        }

        const retryData = await retryRes.json();
        const retryResponse = NextResponse.json(retryData);
        setTokenCookies(retryResponse, newTokenData);
        return retryResponse;
      }

      const text = await logRes.text();
      return NextResponse.json(
        { error: `Failed to fetch access-log: ${logRes.status} ${text}` },
        { status: logRes.status }
      );
    }

    const logData = await logRes.json();
    const successResponse = NextResponse.json(logData);
    setTokenCookies(successResponse, tokenData);

    return successResponse;
  } catch (err: any) {
    console.error("API smartcards error:", err);
    clearTokenCookies(response);

    const errorResponse = NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );

    clearTokenCookies(errorResponse);
    return errorResponse;
  }
}

export async function GET(req: NextRequest) {
  try {
    const existingToken = await getTokenFromCookies();

    if (!existingToken) {
      return NextResponse.json(
        { authenticated: false, message: "No token found" },
        { status: 200 }
      );
    }

    const isExpired = isTokenExpired(existingToken.expires_at);

    return NextResponse.json({
      authenticated: !isExpired,
      expires_at: existingToken.expires_at,
      expires_in_minutes: isExpired
        ? 0
        : Math.round(
            (new Date(existingToken.expires_at).getTime() -
              new Date().getTime()) /
              (1000 * 60)
          ),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check token status" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ message: "Logged out successfully" });
  clearTokenCookies(response);
  return response;
}
