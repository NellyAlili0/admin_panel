import Form from "./form";

export const metadata = {
  title: "Login",
  description: "Login to admin panel",
};
export default async function Page() {
  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Please enter your credentials to login
          </p>
        </div>

        <Form />
      </div>
    </section>
  );
}
