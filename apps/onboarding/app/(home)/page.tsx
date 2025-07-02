import React from "react";
import Form from "./form";
import { db } from "@repo/database";

async function Home() {
  const school = "";
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
