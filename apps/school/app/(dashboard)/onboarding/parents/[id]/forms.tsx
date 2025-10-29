"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionState } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { editParent, addStudent } from "./actions";

export const initialState = {
  message: "",
  success: false,
  redirectTo: "/overview",
};

export const EditParentForm = ({ parent }: { parent: any }) => {
  const [state, action, isPending] = useActionState(editParent, initialState);
  const [open, setOpen] = useState(false);
  const [lastProcessedState, setLastProcessedState] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Don't process the same state twice
    if (state === lastProcessedState || state === initialState) return;

    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        setOpen(false);
        setLastProcessedState(state);
        router.refresh();
      } else {
        toast.error(state.message);
        setLastProcessedState(state);
      }
    }
  }, [state, lastProcessedState, router]);

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
          Edit Parent
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Parent</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                placeholder="Rajesh"
                disabled={isPending}
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                placeholder="Maheshwari"
                disabled={isPending}
              />
            </div>
            <div className="md:col-span-2 hidden">
              <input
                type="text"
                id="customer_id"
                name="customer_id"
                value={parent}
                readOnly
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                placeholder="+25412345678"
                disabled={isPending}
              />
            </div>
            <div>
              <label
                htmlFor="national_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                National ID
              </label>
              <input
                type="text"
                id="national_id"
                name="national_id"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                placeholder="322345678"
                disabled={isPending}
              />
            </div>
            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                disabled={isPending}
              />
            </div>
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                disabled={isPending}
              >
                <option value="">Select your gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
          <div className="mt-8">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isPending ? "Updating..." : "Update Parent"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface AddStudentFormProps {
  parent: string;
  wallet_id: string;
  onStudentAdded?: () => void;
}

export function AddStudentForm({
  parent,
  wallet_id,
  onStudentAdded,
}: AddStudentFormProps) {
  const [state, formAction, isPending] = useActionState(
    addStudent,
    initialState
  );
  const [open, setOpen] = useState(false);
  const [lastProcessedState, setLastProcessedState] = useState<any>(null);

  useEffect(() => {
    // Don't process the same state twice
    if (state === lastProcessedState || state === initialState) return;

    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        setOpen(false);
        setLastProcessedState(state);

        // Refresh student list
        onStudentAdded?.();
      } else {
        toast.error(state.message);
        setLastProcessedState(state);
      }
    }
  }, [state, lastProcessedState, onStudentAdded]);

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
          Add Student
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 text-gray-800">
            Create Student
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                required
                type="text"
                id="first_name"
                name="first_name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                placeholder="Rajesh"
                disabled={isPending}
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                required
                type="text"
                id="last_name"
                name="last_name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                placeholder="Maheshwari"
                disabled={isPending}
              />
            </div>

            <input type="hidden" name="customer_id" value={parent} />

            <input type="hidden" name="wallet_id" value={wallet_id} />

            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date of Birth
              </label>
              <input
                required
                type="date"
                id="dob"
                name="dob"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                disabled={isPending}
              />
            </div>
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 transition duration-150 ease-in-out"
                disabled={isPending}
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
              className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isPending ? "Creating Student..." : "Create Student"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
