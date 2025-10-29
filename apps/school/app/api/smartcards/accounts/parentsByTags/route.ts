import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "../../utils/auth";
import { makeAuthenticatedRequest } from "../../utils/requests";

export async function POST(req: NextRequest) {
  try {
    const { email, password, tags } = await req.json();
    if (!Array.isArray(tags)) throw new Error("tags must be an array");

    const params = new URLSearchParams();
    tags.forEach((t) => params.append("tags[]", t));

    const { token } = await getValidToken(email, password);
    const res = await makeAuthenticatedRequest(
      `https://api.terrasofthq.com/api/accounts?${params.toString()}`,
      // `https://api.terrasofthq.com/api/accounts?tags[]=1b8d5703-b389-4d55-bc53-466ed165f294`,
      token
    );
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
