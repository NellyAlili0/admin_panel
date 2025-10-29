"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addZone } from "./actions";
import { initialState } from "@/lib/utils";
import { toast } from "sonner";

interface AddZoneFormProps {
  onZoneAdded?: () => void;
}

export const AddZoneForm = ({ onZoneAdded }: AddZoneFormProps) => {
  const [state, action, isPending] = useActionState(addZone, initialState);
  const [open, setOpen] = useState(false);
  const [lastProcessedState, setLastProcessedState] = useState<any>(null);

  useEffect(() => {
    // Don't process the same state twice or initial state
    if (state === lastProcessedState || state === initialState) return;

    if (state?.message) {
      if (state?.success) {
        toast.success(state.message);
        setOpen(false); // Close the dialog on success
        setLastProcessedState(state);
        onZoneAdded?.(); // Refresh the zones list
      } else {
        toast.error(state.message);
        setLastProcessedState(state);
      }
    }
  }, [state, lastProcessedState, onZoneAdded]);

  // Reset processed state when dialog closes
  useEffect(() => {
    if (!open) {
      setLastProcessedState(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex bg-[#efb100] hover:bg-[#efaf008f] text-white text-base font-medium px-6 py-2 outline-none rounded w-max cursor-pointer mx-auto">
          Add Zone
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 text-gray-800">
            Create Zone
          </DialogTitle>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                required
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out focus:ring-2 focus:ring-[#efb100] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="westlands"
                disabled={isPending}
              />
            </div>
            {/* Note */}
            <div className="md:col-span-2">
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <input
                type="text"
                id="note"
                name="note"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out focus:ring-2 focus:ring-[#efb100] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Zone for westlands area"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Error message display */}
          {state?.message && !state?.success && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{state.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#efb100] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Zone...
                </span>
              ) : (
                "Create Zone"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
