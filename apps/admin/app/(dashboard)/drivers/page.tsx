import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { AddDriverForm } from "./forms";
import { database } from "@/database/config";
import SearchBar from "./search-bar"; // 👈 new component

export default async function Page() {
  const allDrivers = await database
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
    .orderBy("user.email", "asc")
    .execute();

  const kycRequests = await database
    .selectFrom("kyc")
    .leftJoin("user", "kyc.userId", "user.id")
    .select(["kyc.id", "user.name", "user.email", "kyc.is_verified"])
    .where("kyc.is_verified", "=", false)
    .orderBy("user.email", "asc")
    .execute();

  const drivers = allDrivers.map((driver) => ({
    ...driver,
    verified: driver.verified ? "Yes" : "No",
  }));

  const kycs = kycRequests.map((request) => ({
    ...request,
    verified: request.is_verified ? "Yes" : "No",
  }));

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs items={[{ href: "/drivers", label: "Drivers" }]} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
        </div>
        <AddDriverForm />
      </div>

      {/* 🔍 Search bar client component */}
      <SearchBar data={drivers} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8">
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
        baseLink="/drivers/"
        uniqueKey="email"
      />
    </div>
  );
}
