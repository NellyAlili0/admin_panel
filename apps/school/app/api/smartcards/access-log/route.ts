import { NextRequest, NextResponse } from "next/server";
import { getValidToken, setTokenCookies } from "../utils/auth";
import { makeAuthenticatedRequest } from "../utils/requests";

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  try {
    const { email, password, page = 1, tag } = await req.json();
    if (!email || !password || !tag)
      return NextResponse.json(
        { error: "email, password & tag required" },
        { status: 400 }
      );

    const { token, tokenData } = await getValidToken(email, password);
    setTokenCookies(res, tokenData);

    const terra = await makeAuthenticatedRequest(
      `https://api.terrasofthq.com/api/access-log?page=${page}&tags[]=${tag}`,
      token
    );

    return NextResponse.json(await terra.json());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
