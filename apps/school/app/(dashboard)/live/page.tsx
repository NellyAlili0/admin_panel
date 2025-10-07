import React from "react";
import { cookies } from "next/headers";
import Live from "./Live";

async function page() {
  const cookieStore = await cookies();
  const school_id = cookieStore.get("school_id")?.value;
  const schoolId = Number(school_id);

  return <Live schoolId={schoolId} />;
}

export default page;
