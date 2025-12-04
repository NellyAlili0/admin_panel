import { NextResponse } from "next/server";

// This endpoint receives a timeout notification from Safaricom
export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("Account Balance Timeout Callback:", data);

    // TODO: Store timeout info in DB for tracking / alerting
    // Example: await prisma.accountBalanceTimeout.create({ data });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing account balance timeout:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process timeout callback" },
      { status: 500 }
    );
  }
}
