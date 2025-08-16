import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, TrendingUp, Fuel } from "lucide-react";
import { database, sql } from "@/database/config";

export default async function Page() {
  interface Metrics {
    driver_balance: number | null;
    total_transactions: number;
    total_deposits: number | null;
    total_withdraws: number | null;
  }

  const metricsResult = await database.executeQuery<Metrics>(
    sql<Metrics>`
    SELECT
      SUM(driver_balance) AS driver_balance,
      COUNT(*) AS total_transactions,
      SUM(deposit) AS total_deposits,
      SUM(withdraw) AS total_withdraws
    FROM transactions
  `.compile(database)
  );

  const metrics: Metrics = metricsResult.rows[0];

  let driverBalance = metrics.driver_balance;
  let totalTransactions = metrics.total_transactions;
  let totalDeposits = metrics.total_deposits;
  let totalWithdraws = metrics.total_withdraws;

  // Recent transactions
  let recentTransactions = await database
    .selectFrom("payment")
    .select([
      "payment.id",
      "payment.amount",
      "payment.kind",
      "payment.comments",
      "payment.transaction_type as type",
      "payment.created_at",
    ])
    .orderBy("payment.created_at", "desc")
    .execute();

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/finance",
            label: "Finance",
          },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <p className="text-muted-foreground"> Finance Transactions </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Driver Balance
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driverBalance} KES</div>
            <p className="text-xs text-muted-foreground">All Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deposits
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeposits} KES</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Withdraws
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWithdraws} KES</div>
            <p className="text-xs text-muted-foreground">All Withdrawals</p>
          </CardContent>
        </Card>
      </div>
      <GenTable
        title="All Finance"
        cols={["id", "amount", "kind", "comments", "type", "created_at"]}
        data={recentTransactions}
        baseLink="/finance/"
        uniqueKey="id"
      />
    </div>
  );
}
