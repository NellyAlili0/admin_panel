import { Breadcrumbs } from "@/components/breadcrumbs";
import { db } from "@repo/database";
import GenTable from "@/components/tables";

export default async function Page() {
  // available drivers
  // kyc requests
  let allDrivers = await db
    .selectFrom("user")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.phone_number as phone",
      "user.wallet_balance as balance",
      "user.created_at",
      'is_kyc_verified as verified'
    ])
    .where("user.kind", "=", "Driver")
    .execute();
  let kycRequests = await db
    .selectFrom("kyc")
    .leftJoin("user", "kyc.user_id", "user.id")
    .select(["kyc.id", "user.name", "user.email", "kyc.created_at"])
    .where("kyc.is_verified", "=", false)
    .execute();
  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/drivers",
            label: "Drivers",
          },
        ]}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">Manage your drivers</p>
        </div>
      </div>
      <GenTable
        title="All Drivers"
        cols={["id", "name", "email", "phone", "balance", "created_at", "verified"]}
        data={allDrivers}
        baseLink="/drivers/"
        uniqueKey="email"
      />
      <GenTable
        title="KYC Requests"
        cols={["id", "name", "email", "created_at"]}
        data={kycRequests}
        baseLink="/drivers/kyc/"
        uniqueKey="id"
      />
    </div>
  );
}
