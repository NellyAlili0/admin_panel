"use client";
import { login } from "./actions";
import { useActionState } from "react";
import { useEffect } from "react";
import { initialState } from "@/lib/utils";
import { toast } from "sonner";
import { LoginButton } from "../../components/login-button";

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

      <LoginButton title="Sign In" />
      {state.message && (
        <p className="text-red-500 mt-2 text-center">{state.message}</p>
      )}
    </form>
  );
}
