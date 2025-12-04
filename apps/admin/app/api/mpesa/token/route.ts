import { NextResponse } from "next/server";

export async function GET() {
  const consumerKey = process.env.MPESA_KEY!;
  const consumerSecret = process.env.MPESA_SECRET!;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const res = await fetch(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
