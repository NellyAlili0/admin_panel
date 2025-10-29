import { NextRequest, NextResponse } from "next/server";
import { getValidToken } from "../../utils/auth";
import { makeAuthenticatedRequest } from "../../utils/requests";

export async function POST(req: NextRequest) {
  try {
    const { email, password, account_id } = await req.json();
    const { token } = await getValidToken(email, password);
    console.log(account_id);
    const res = await makeAuthenticatedRequest(
      `https://api.terrasofthq.com/api/accounts/${account_id}`,
      //   `https://api.terrasofthq.com/api/dependants?tags[]=8b308c54-24a2-45fa-9460-f3fec457bd30`,
      token
    );
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
