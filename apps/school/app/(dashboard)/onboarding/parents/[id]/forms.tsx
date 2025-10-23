"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { editParent, addStudent } from "./actions";

export const initialState = {
  message: "",
  success: false,
  redirectTo: "/overview",
};

export const EditParentForm = ({ parent }: { parent: any }) => {
  const [state, action] = useActionState(editParent, initialState);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router]);

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
            {/* First Name */}
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="Rajesh"
              />
            </div>
            {/* Last Name */}
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="Maheshwari"
              />
            </div>
            {/* Email */}
            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="rajesh@example.com"
              />
            </div>
            {/* Phone Number */}
            <div className="">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="+25412345678"
              />
            </div>
            {/* National ID */}
            <div className="">
              <label
                htmlFor="national_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                National ID
              </label>
              <input
                type="text"
                id="national_id"
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="322345678"
                name="national_id"
              />
            </div>
            {/* Date of Birth */}
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
              />
            </div>
            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender
              </label>
              <select
                id="gender"
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                name="gender"
              >
                <option value="">Select your gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Update Parent
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export function AddStudentForm({ parentId }: { parentId: string }) {
  const [state, formAction] = useActionState(addStudent, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.message.includes("successfully")) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex bg-[#efb100] hover:bg-[#efaf008f] text-white text-base font-medium px-6 py-2 outline-none rounded w-max cursor-pointer mx-auto">
          Add Student
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 text-gray-800">
            Create Student
          </DialogTitle>{" "}
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="Rajesh"
              />
            </div>
            {/* Last Name */}
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="Maheshwari"
              />
            </div>

            {/* Phone Number */}
            <div className="">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="+25412345678"
              />
            </div>

            {/* Customer ID  */}
            <div className="hidden">
              <label
                htmlFor="customer_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Customer ID
              </label>
              <input
                type="text"
                id="customer_id"
                name="customer_id"
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="56412345678"
              />
            </div>

            {/* Wallet ID */}
            <div className="hidden">
              <label
                htmlFor="wallet_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Wallet ID
              </label>
              <input
                type="text"
                id="wallet_id"
                name="wallet_id"
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                placeholder="45412345678"
              />
            </div>

            {/* Date of Birth */}
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
              />
            </div>
            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gender
              </label>
              <select
                id="gender"
                className="w-full px-4 py-3 rounded-lg border border-gray-300  transition duration-150 ease-in-out"
                name="gender"
              >
                <option value="">Select your gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Create Student
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
