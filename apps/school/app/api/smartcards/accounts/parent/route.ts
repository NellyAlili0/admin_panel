import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "../../utils/auth";
import { makeAuthenticatedRequest } from "../../utils/requests";

export async function POST(req: NextRequest) {
  try {
    const { email, password, account_id, page = 1 } = await req.json();
    const { token } = await getValidToken(email, password);
    console.log(account_id, page);

    const res = await makeAuthenticatedRequest(
      `https://api.terrasofthq.com/api/accounts/${account_id}?page=${page}`,
      token
    );
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
