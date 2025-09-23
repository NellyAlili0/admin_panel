import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { AddDriverForm } from "./forms";
import { database } from "@/database/config";

export default async function Page() {
  // available drivers
  let allDrivers = await database
    .selectFrom("user")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.phone_number as phone",
      "user.wallet_balance as balance",
      "user.is_kyc_verified as verified",
    ])
    .where("user.kind", "=", "Driver")
    .execute();

  let kycRequests = await database
    .selectFrom("kyc")
    .leftJoin("user", "kyc.userId", "user.id") // Changed from kyc.user_id to kyc.userId
    .select(["kyc.id", "user.name", "user.email", "kyc.is_verified"])
    .where("kyc.is_verified", "=", false)
    .execute();

  let drivers = allDrivers.map((driver) => ({
    ...driver,
    verified: driver.verified ? "Yes" : "No",
  }));

  let kycs = kycRequests.map((request) => ({
    ...request,
    verified: request.is_verified ? "Yes" : "No",
  }));

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
        </div>
        <AddDriverForm />
      </div>
      <GenTable
        title="All Drivers"
        cols={["name", "email", "phone", "verified", "balance"]}
        data={drivers}
        baseLink="/drivers/"
        uniqueKey="email"
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Unverified KYC Requests
          </h1>
        </div>
      </div>
      <GenTable
        title="KYC Requests"
        cols={["name", "email", "verified"]}
        data={kycs}
        baseLink="/drivers/kyc/"
        uniqueKey="id"
      />
    </div>
  );
}
