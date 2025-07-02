import React from "react";
import Form from "../(home)/form";
import { db } from "@repo/database";

function deslugifyFromSubdomain(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toLowerCase() + word.slice(1))
    .join(" ");
}

async function Home({ params }: { params: Promise<{ school: string }> }) {
  const school_url = (await params).school;
  const school = deslugifyFromSubdomain(school_url);
  const schools = await db
    .selectFrom("school")
    .select(["id", "name"])
    .execute();
  return (
    <div>
      <Form current_school={school} schools={schools} />
    </div>
  );
}

export default Home;
