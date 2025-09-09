"use client";
import { login } from "./actions";
import { useActionState } from "react";
import { useEffect } from "react";
import { initialState } from "@/lib/utils";
import { toast } from "sonner";

export default function Form() {
  const [state, formAction] = useActionState(login, initialState);
  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state]);
  return (
    <form className="space-y-6" action={formAction}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="your@email.com"
          required
          name="email"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
          required
          name="password"
        />
      </div>

      {/* <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="remember"
            className="ml-2 block text-sm text-gray-700"
          >
            Remember me
          </label>
        </div>

        <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
          Forgot password?
        </a>
      </div> */}

      <button
        type="submit"
        className="w-full bg-[#efb100] text-white py-2 px-4 rounded-md hover:bg-[#b88600] focus:outline-none focus:ring-2 focus:ring-[#b88600] focus:ring-offset-2 transition duration-150"
      >
        Sign In
      </button>
      {state.message && (
        <p className="text-red-500 mt-2 text-center">{state.message}</p>
      )}
    </form>
  );
}
