import { Navbar } from "./navbar";
import { Auth } from "@/Authentication/index";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = new Auth();
  const cookieStore = await cookies();
  const session = cookieStore.get("token");

  if (!session?.value) {
    return redirect("/login");
  }

  const payload = auth.school_decode({ token: session.value });

  if (!payload) {
    return redirect("/login");
  }

  return (
    <section className="h-screen grid grid-cols-12 overflow-x-hidden">
      <div className="col-span-2">
        <Navbar />
      </div>
      <div className="col-span-10 overflow-y-auto flex flex-col gap-2 p-4 md:p-6 pt-4">
        {children}
      </div>
    </section>
  );
}
