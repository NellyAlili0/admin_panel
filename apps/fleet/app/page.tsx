
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Auth } from "@repo/handlers/auth";

export default async function Page() {
  const headers = await cookies()
  const token = headers.get('token')
  if (token) {
    const auth = new Auth()
    const decoded = auth.decode({ token: token.value })
    if (!decoded) {
      return redirect('/login')
    }
    return redirect('/dashboard')
  }
  return redirect('/login')
}

