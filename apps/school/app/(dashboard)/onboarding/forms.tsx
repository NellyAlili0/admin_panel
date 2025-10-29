"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addParent } from "./actions";
import { initialState } from "@/lib/utils";
import { toast } from "sonner";

interface AddParentFormProps {
  onParentAdded?: () => void;
}

export const AddParentForm = ({ onParentAdded }: AddParentFormProps) => {
  const [state, action, isPending] = useActionState(addParent, initialState);
  const [open, setOpen] = useState(false);
  const [lastProcessedState, setLastProcessedState] = useState<any>(null);

  useEffect(() => {
    // Don't process the same state twice
    if (state === lastProcessedState) return;

    // Don't process initial state
    if (state === initialState) return;

    // ❌ Handle error
    if (state?.message && !state?.success) {
      toast.error(state.message);
      setLastProcessedState(state);
    }

    // ✅ Handle success
    if (state?.success) {
      toast.success("Parent created successfully!");
      setOpen(false);
      setLastProcessedState(state);

      // ✅ Refresh parent list without reload
      onParentAdded?.();
    }
  }, [state, lastProcessedState, onParentAdded]);

  // Reset processed state when dialog closes
  useEffect(() => {
    if (!open) {
      setLastProcessedState(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex bg-[#efb100] hover:bg-[#efaf008f] text-white text-base font-medium px-6 py-2 rounded cursor-pointer mx-auto">
          Add Parent
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 text-gray-800">
            Create Parent
          </DialogTitle>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput name="first_name" label="First Name" required />
            <FormInput name="last_name" label="Last Name" required />
            <FormInput
              name="email"
              label="Email Address"
              type="email"
              required
              fullWidth
            />
            <FormInput name="phone" label="Phone Number" required />
            <FormInput name="national_id" label="National ID" required />
            <FormInput name="dob" label="Date of Birth" type="date" required />
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender
              </label>
              <select
                required
                id="gender"
                name="gender"
                className="w-full px-4 py-3 rounded-lg border border-gray-300"
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-70"
            >
              {isPending ? "Submitting..." : "Create Parent"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ✅ Helper input component
function FormInput({
  name,
  label,
  type = "text",
  required,
  placeholder,
  fullWidth,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        required={required}
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-gray-300"
      />
    </div>
  );
}
