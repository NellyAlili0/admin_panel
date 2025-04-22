import { Navbar } from "@/components/navbar";
import {Auth} from "@repo/handlers/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Zidallie - Fleet Management",
    description: "Zidallie - Fleet Management",
}
export default async function Layout({ children }: { children: React.ReactNode }) {
    // const cookieStore = await cookies()
    // const token = cookieStore.get("token")
    // if (!token) {
    //     return redirect('/login')
    // }
    // let auth = new Auth()
    // const decoded = auth.decode({ token: token.value })
    // if (!decoded) {
    //     return redirect('/login')
    // }
    return (
        <section>
            <Navbar />
            {children}
        </section>
    );
}