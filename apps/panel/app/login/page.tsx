import Link from "next/link";
import Form from "./form";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="min-w-[400px] bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <Form />
      </div>
    </div>
  );
}