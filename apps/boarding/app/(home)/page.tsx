import React, { Suspense } from "react";
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
      <Suspense
        fallback={
          <div className=" min-h-screen w-full flex items-center justify-center ">
            Loading form...
          </div>
        }
      >
        <Form current_school={school} schools={schools} />
      </Suspense>
    </div>
  );
}

export default Home;
