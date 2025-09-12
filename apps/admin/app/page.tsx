import Image from "next/image";
import Form from "./login/form";

export default function Home() {
  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Zidallie Admin</h1>
          <p className="text-gray-600 mt-2">
            Please enter your credentials to login
          </p>
        </div>

        <Form />
      </div>
    </section>
  );
}
