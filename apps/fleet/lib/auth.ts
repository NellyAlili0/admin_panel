import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import { Auth } from "@repo/handlers/auth";

export const authDetails = async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")
    if (!token) {
        return null
    }
    let auth = new Auth()
    const decoded = auth.decode({ token: token.value })
    if (!decoded) {
        return null
    }
    return decoded
}
