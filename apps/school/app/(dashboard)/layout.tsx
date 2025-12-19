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
    // Changed from grid to flex for better responsive control
    <section className="h-screen flex overflow-hidden bg-background">
      {/* Navbar handles its own visibility/width logic */}
      <Navbar />

      {/* Content Area */}
      {/* Added pt-14 for mobile to account for the menu button space */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4 pt-16 md:pt-6 md:p-6">
        {children}
      </div>
    </section>
  );
}
