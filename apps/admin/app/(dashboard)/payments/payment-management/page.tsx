import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import GenTable from "@/components/tables";
import SearchBar from "./search-bar";

export default async function Page() {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/balance`);

  // Fetch all account balance callbacks
  const balances = await database
    .selectFrom("account_balance_callbacks")
    .select(["id", "account_type", "raw_result", "created_at"])
    .orderBy("created_at", "desc")
    .execute();

  // Helper to parse raw_result and extract account balances
  const parseAccountBalances = (raw: any) => {
    try {
      const params = raw?.Result?.ResultParameters?.ResultParameter;
      const accountBalanceStr = params?.find(
        (p: any) => p.Key === "AccountBalance"
      )?.Value;
      if (!accountBalanceStr) return {};
      return accountBalanceStr.split("&").reduce((acc: any, item: string) => {
        const [name, , balance] = item.split("|");
        acc[name] = parseFloat(balance);
        return acc;
      }, {});
    } catch (err) {
      console.error("Failed to parse raw_result", err);
      return {};
    }
  };

  // Format for display
  const formattedBalances = balances.map((b) => {
    const accounts = parseAccountBalances(b.raw_result);
    return {
      id: b.id,
      account_type: b.account_type,
      dateAdded:
        b.created_at && !isNaN(new Date(b.created_at).getTime())
          ? new Date(b.created_at).toLocaleString()
          : "N/A",
      working_account: accounts["Working Account"] ?? 0,
      utility_account: accounts["Utility Account"] ?? 0,
    };
  });

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[{ href: "/mpesa/balances", label: "M-Pesa Balances" }]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            M-Pesa Account Balances
          </h1>
          <p className="text-muted-foreground my-3">
            Total of {formattedBalances.length} balance records
          </p>
        </div>
      </div>

      <SearchBar data={formattedBalances} />
    </div>
  );
}
