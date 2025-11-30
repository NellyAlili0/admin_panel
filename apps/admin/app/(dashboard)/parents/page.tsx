import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import GenTable from "@/components/tables";
import { CreateParent } from "./forms";
import SearchBar from "./search-bar";

export default async function Page() {
  // Fetch all parents from the `user` table
  const parents = await database
    .selectFrom("user")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.phone_number",
      "user.wallet_balance",
      "user.is_kyc_verified",
      "user.created_at",
    ])
    .where("user.kind", "=", "Parent")
    .orderBy("user.email", "asc")
    .execute();

  const totalParents = parents.length;

  const formattedParents = parents.map((parent) => ({
    ...parent,
    is_kyc_verified: parent.is_kyc_verified ? "Yes" : "No",
    name: parent.name || parent.email?.split("@")[0] || "N/A",
  }));

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs items={[{ href: "/parents", label: "Parents" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parents</h1>
          <p className="text-muted-foreground my-3">
            Total of {totalParents} parents
          </p>
        </div>
        <CreateParent />
      </div>

      <SearchBar data={formattedParents} />
    </div>
  );
}
