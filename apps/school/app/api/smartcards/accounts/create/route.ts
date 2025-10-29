import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "../../utils/auth";
import { makeAuthenticatedRequest } from "../../utils/requests";

export async function POST(req: NextRequest) {
  try {
    const { email, password, body } = await req.json();
    const { token } = await getValidToken(email, password);
    const res = await makeAuthenticatedRequest(
      "https://api.terrasofthq.com/api/accounts",
      token,
      { method: "POST", body: JSON.stringify(body) }
    );
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
