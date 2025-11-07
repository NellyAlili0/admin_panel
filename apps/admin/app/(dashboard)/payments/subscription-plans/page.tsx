import { Breadcrumbs } from "@/components/breadcrumbs";
import { database } from "@/database/config";
import { PlansSearch } from "./search-bar";

const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return "N/A";

  try {
    // If it's already converted by PostgreSQL, just format it
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
  const plansRaw = await database
    .selectFrom("subscription_plans")
    .innerJoin("school", "school.id", "subscription_plans.school_id")
    .select([
      "subscription_plans.id",
      "school.name as school_name",
      "subscription_plans.description",
      "subscription_plans.duration_days",
      "subscription_plans.price",
      "subscription_plans.is_active",
      "subscription_plans.created_at",
    ])
    .orderBy("subscription_plans.id", "desc")
    .execute();

  const plans = plansRaw.map((p) => ({
    ...p,
    is_active_label: p.is_active ? "ACTIVE" : "INACTIVE",
    payment_date: formatTimestamp(p.created_at),
  }));

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs
        items={[
          {
            href: "/subscriptions/plans",
            label: "Subscription Plans",
          },
        ]}
      />

      {/* Client-side search & table */}

      <PlansSearch data={plans} />
    </div>
  );
}
