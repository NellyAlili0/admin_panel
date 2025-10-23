"use client";

import { useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addDriver } from "./actions";
import { initialState } from "@/lib/utils";
import { toast } from "sonner";

export const AddDriverForm = () => {
  const [state, action] = useActionState(addDriver, initialState);
  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state]);
  return (
    <Dialog>
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
                type="text"
                id="name"
                name="name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="westlands"
              />
            </div>
            {/* Note */}
            <div className="md:col-span-2">
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Note
              </label>
              <input
                type="text"
                id="note"
                name="note"
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="Maheshwari"
              />
            </div>
          </div>
          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Zone
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
