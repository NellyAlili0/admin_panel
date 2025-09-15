import React, { Suspense } from "react";
import Form from "./form";
import { database } from "../../database/config";

async function Home() {
  const school = "";
  const schools = await database
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
