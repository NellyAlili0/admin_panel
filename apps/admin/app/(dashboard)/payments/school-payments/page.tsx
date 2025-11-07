import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { B2cMpesaSearch } from "./search-bar";

const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return "N/A";

  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "Error formatting date";
  }
};

export default async function Page() {
  const transactionsRaw = await database
    .selectFrom("b2cmpesa_transactions")
    .select([
      "id",
      "transaction_id",
      "transaction_amount",
      "receiver_party_public_name",
      "transaction_completed_at",
      "created_at",
    ])
    .orderBy("created_at", "desc")
    .execute();

  const totalAmount = await database
    .selectFrom("b2cmpesa_transactions")
    .select((eb) => eb.fn.sum("transaction_amount").as("total"))
    .executeTakeFirst();

  const totalPaid = Number(totalAmount?.total ?? 0);

  const transactions = transactionsRaw.map((t) => ({
    ...t,
    transaction_amount: Number(t.transaction_amount ?? 0),
    transaction_completed_date: formatTimestamp(t.transaction_completed_at),
    created_date: formatTimestamp(t.created_at),
  }));

  const totalTransactions = transactions.length;

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/payments/b2c-mpesa",
            label: "B2C M-Pesa Transactions",
          },
        ]}
      />

      <div className="mt-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground my-1">
              Total B2C Transactions
            </p>
            <p className="text-3xl font-bold tracking-tight my-1">
              KES {totalPaid.toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Number of Records</p>
            <p className="font-medium text-lg">{totalTransactions}</p>
          </div>
        </div>
      </div>

      <B2cMpesaSearch data={transactions} />
    </div>
  );
}
