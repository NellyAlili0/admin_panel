import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Auth } from "@repo/handlers/auth";
import Form from "./form";

export const metadata = {
    title: 'Login',
    description: 'Login to admin panel',
}
export default async function Page() {
    return (
        <div className="flex items-center justify-center h-screen bg-primary">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4 text-center"> Admin Panel </h1>
                <Form />
            </div>
        </div>
    )
}