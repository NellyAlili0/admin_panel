import { Breadcrumbs } from "@/components/breadcrumbs";
import GenTable from "@/components/tables";
import { database } from "@/database/config";
import { format } from "date-fns";

export default async function PaymentTermsPage() {
  const termsRaw = await database
    .selectFrom("payment_terms")
    .leftJoin("school", "school.id", "payment_terms.schoolId")
    .select([
      "payment_terms.id",
      "payment_terms.name",
      "payment_terms.start_date",
      "payment_terms.end_date",
      "payment_terms.is_active",
      "payment_terms.created_at",
      "school.name as school_name",
    ])
    .orderBy("payment_terms.created_at", "desc")
    .execute();

  const terms = termsRaw.map((t) => ({
    ...t,
    start_date_formatted: format(new Date(t.start_date), "dd/MM/yyyy"),
    end_date_formatted: format(new Date(t.end_date), "dd/MM/yyyy"),
    created_at_formatted: format(new Date(t.created_at), "dd/MM/yyyy HH:mm:ss"),
    school_name: t.school_name ?? "N/A",
    status: t.is_active ? "Active" : "Inactive",
  }));

  const activeTerms = terms.filter((t) => t.is_active).length;
  const totalTerms = terms.length;

  return (
    <div className="flex flex-col gap-2 p-6">
      <Breadcrumbs
        items={[
          {
            href: "/payment-terms",
            label: "Payment Terms",
          },
        ]}
      />

      <div className="mt-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground my-1">
              Total Payment Terms
            </p>
            <p className="text-3xl font-bold tracking-tight my-1">
              {totalTerms}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active Terms</p>
            <p className="font-medium text-lg text-green-600">{activeTerms}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <GenTable
          title="All Payment Terms"
          cols={[
            "id",
            "name",
            "school_name",
            "start_date_formatted",
            "end_date_formatted",
            "status",
            "created_at_formatted",
          ]}
          data={terms}
          baseLink="terms/"
          uniqueKey="id"
        />
      </div>
    </div>
  );
}
