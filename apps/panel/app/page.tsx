import { Auth } from "@repo/handlers/auth";
import Link from "next/link";
export default function Home() {
  let auth = new Auth();
  return (
    <div className="flex flex-col min-h-screen justify-center items-center gap-2">
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-bold">
        Zidallie
        </p>
        <Link href="/login" className="text-primary font-bold">Login</Link>
      </div>
    </div>
  );
}
