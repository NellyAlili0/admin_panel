import Link from "next/link";
import { usePathname } from "next/navigation";
import SideLinks from "./sidelinks";
import { logout } from "../action";

export default function Layout({ children }: { children: React.ReactNode }) {

    return (
        <section className="grid grid-cols-12 min-h-screen">
            <div className="col-span-2 h-full bg-primary text-white">
                <div className="flex flex-col h-full">
                    <div className="flex flex-col justify-between gap-2 h-full">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-xl font-semibold px-4 py-4">
                                Zidallie Finance
                            </h1>
                            <hr />
                            <SideLinks />
                        </div>
                        <div className="flex flex-col gap-4 text-xl pb-4">
                            <form action={logout}>
                                <button type="submit" className="text-red-500 p-4 cursor-pointer">
                                    Logout
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-10">
                {children}
            </div>
        </section>
    );
}