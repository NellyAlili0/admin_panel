import React from "react";
import Form from "./form";
import { db } from "@repo/database";

async function Home() {
  const schools = await db
    .selectFrom("school")
    .select(["id", "name"])
    .execute();
  return (
    <div>
      <Form schools={schools} />
    </div>
  );
}

export default Home;
