"use server";

import React from "react";
import DownloadReport from "./DownloasReport";
import { cookies } from "next/headers";
import { database } from "@/database/config";

export default async function Page() {
  const cookieStore = await cookies();
  const school_id = cookieStore.get("school_id")?.value;
  const schoolId = Number(school_id);

  // Fetch school info
  const schoolInfo = await database
    .selectFrom("school")
    .select(["school.id", "school.name", "school.smart_card_url"])
    .where("school.id", "=", schoolId)
    .executeTakeFirst();

  if (!schoolInfo) {
    return <div>School not found</div>;
  }

  if (!schoolInfo.smart_card_url) {
    return <div>No Smart Card URL available for this school.</div>;
  }

  return (
    <main className="flex items-center justify-center min-h-screen">
      <DownloadReport
        smartCardUrl={schoolInfo.smart_card_url}
        fileName="school_report.xlsx"
      />
    </main>
  );
}
