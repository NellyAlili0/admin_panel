"use client";

import { SubmitButton } from "@/components/submit-button";
import { login } from "./actions";
import { useActionState } from "react";
import { useEffect } from "react";
import { initialState } from "@/lib/utils";

export default function Form() {
  const [state, formAction] = useActionState(login, initialState);
  useEffect(() => {
    if (state.message) {
      console.log(state.message);
    }
  }, [state]);
  return (
    <form action={formAction}>
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          required
          name="email"
          id="email"
          className="mt-1 p-2 border rounded w-full"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          required
          name="password"
          id="password"
          className="mt-1 p-2 border rounded w-full"
        />
      </div>
      <SubmitButton title="Login" />
      {state.message && (
        <p className="text-red-500 mt-2 text-center">{state.message}</p>
      )}
    </form>
  );
}
