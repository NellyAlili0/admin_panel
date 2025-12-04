import { NextResponse } from "next/server";
import { database } from "@/database/config";

function parseAccountBalance(balanceString: string) {
  return balanceString.split("&").map((account) => {
    const [
      name,
      currency,
      balance,
      availableBalance,
      reservedAmount,
      unpaidAmount,
    ] = account.split("|");

    return {
      name,
      currency,
      balance: parseFloat(balance),
      availableBalance: parseFloat(availableBalance),
      reservedAmount: parseFloat(reservedAmount),
      unpaidAmount: parseFloat(unpaidAmount),
    };
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const params = data?.Result?.ResultParameters?.ResultParameter;
    if (!params) {
      throw new Error("Missing Result Parameters");
    }

    // Extract values
    const actionType = params.find((p) => p.Key === "ActionType")?.Value;
    const accountBalanceRaw = params.find(
      (p) => p.Key === "AccountBalance"
    )?.Value;
    const completedTimeStr = params.find(
      (p) => p.Key === "BOCompletedTime"
    )?.Value;

    const completedTime = completedTimeStr ? new Date(completedTimeStr) : null;

    // Parse the string balance
    const parsedBalances = accountBalanceRaw
      ? parseAccountBalance(accountBalanceRaw)
      : null;

    // console.log("Parsed Account Balances:", parsedBalances);
    // console.log("Action Type:", actionType);
    // console.log("BO Completed Time:", completedTime);

    await database
      .insertInto("account_balance_callbacks")
      .values({
        account_type: actionType ?? "UNKNOWN",
        completed_time: completedTime,
        raw_result: data,
        created_at: new Date(),
      })
      .executeTakeFirst();

    return NextResponse.json({
      success: true,
      message: "Callback stored successfully",
    });
  } catch (error) {
    console.error("Error processing account balance callback:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process callback" },
      { status: 500 }
    );
  }
}
