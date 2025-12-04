import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  // Save to DB (example)
  //   await db.mpesaTransaction.create({
  //     data: {
  //       trans_id: body.TransID,
  //       trans_time: body.TransTime,
  //       amount: parseFloat(body.TransAmount),
  //       phone: body.MSISDN,
  //       name: body.FirstName,
  //       account: body.BillRefNumber,
  //       raw: body,
  //     },
  //   });
  console.log("C2B Payment Received:", body);

  // MUST RESPOND with success message
  return NextResponse.json({
    ResultCode: 0,
    ResultDesc: "Accepted",
  });
}
