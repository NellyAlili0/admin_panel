"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateSubscriptionPlan } from "./actions";

type PlanData = {
  id: number;
  name: string;
  description: string | null;
  duration_days: number;
  price: number;
  is_active: boolean;
  commission_amount: number | null;
  school_id: number;
  school_name: string;
  bank_paybill_number: string | null;
  bank_account_number: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-white bg-[#efb100] hover:bg-[#f7b100c2] focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
    >
      {pending ? "Updating..." : "Update Plan"}
    </button>
  );
}

function SubscriptionPlanEditForm({ plan }: { plan: PlanData }) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    try {
      setError(null);
      await updateSubscriptionPlan(formData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update subscription plan"
      );
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Hidden fields */}
      <input name="id" value={plan.id} readOnly hidden />
      <input name="school_id" value={plan.school_id} readOnly hidden />

      <div className="grid grid-cols-6 gap-6">
        {/* SCHOOL (Read-only) */}
        <div className="col-span-6 sm:col-span-3">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            School
          </label>
          <div className="shadow-sm bg-gray-100 border border-gray-300 text-gray-700 sm:text-sm rounded-lg block w-full p-2.5 cursor-not-allowed">
            {plan.school_name}
          </div>
          <p className="mt-1 text-xs text-gray-500">School cannot be changed</p>
        </div>

        {/* PLAN NAME */}
        <div className="col-span-6 sm:col-span-3">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            Plan Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={plan.name}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="E.g. Termly Plan"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="col-span-full">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={plan.description ?? ""}
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-3"
            placeholder="Optional description"
          />
        </div>

        {/* DURATION */}
        <div className="col-span-6 sm:col-span-2">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            Duration (days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="duration_days"
            required
            min={1}
            defaultValue={plan.duration_days}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="e.g. 90"
          />
        </div>

        {/* PRICE */}
        <div className="col-span-6 sm:col-span-2">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            Price (KES) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            required
            min={0}
            step="0.01"
            defaultValue={plan.price}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="e.g. 10000"
          />
        </div>

        {/* Commission */}
        <div className="col-span-6 sm:col-span-2">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            Commission Amount (optional)
          </label>
          <input
            type="number"
            name="commission_amount"
            min={0}
            step="0.01"
            defaultValue={plan.commission_amount ?? ""}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
            placeholder="e.g. 200"
          />
        </div>

        {/* is_active */}
        <div className="col-span-6 sm:col-span-3 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-900 block">
            Active
          </label>
          <input
            type="checkbox"
            name="is_active"
            value="1"
            defaultChecked={plan.is_active}
            className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-600"
            aria-label="Is active"
          />
          <span className="text-sm text-gray-500">Enable plan</span>
        </div>

        {/* BANK PAYBILL */}
        <div className="col-span-6 sm:col-span-3">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            Bank Paybill Number
          </label>
          <input
            type="text"
            name="bank_paybill_number"
            defaultValue={plan.bank_paybill_number ?? ""}
            placeholder="e.g. 123456"
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
          />
          <p className="mt-1 text-xs text-gray-500">
            Will update school record if empty
          </p>
        </div>

        {/* BANK ACCOUNT */}
        <div className="col-span-6 sm:col-span-3">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            Bank Account Number
          </label>
          <input
            type="text"
            name="bank_account_number"
            defaultValue={plan.bank_account_number ?? ""}
            placeholder="e.g. 001234567890"
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-cyan-600 focus:border-cyan-600 block w-full p-2.5"
          />
          <p className="mt-1 text-xs text-gray-500">
            Will update school record if empty
          </p>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 rounded-b flex justify-end gap-3">
        <SubmitButton />
      </div>
    </form>
  );
}

export { SubscriptionPlanEditForm };
