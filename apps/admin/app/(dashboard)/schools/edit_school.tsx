"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionState } from "react";
import { initialState } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateCredentials } from "./edit_school_actions";

interface SchoolMeta {
  administrator_name: string | null;
  administrator_phone: string | null;
  administrator_email: string | null;
  official_email: string | null;
  logo: string | null;
  longitude: number;
  latitude: number;
}

interface UpdateSchoolProps {
  id: number;
  name: string;
  location: string | null;
  meta: SchoolMeta | null;
  url: string | null;
  has_commission: boolean;
  bank_account_number: string | null;
  bank_paybill_number: string | null;
  commission_amount: number | null;
  terra_email: string | null;
  terra_password: string | null;
}

export function UpdateSchool({
  school_id,
  school,
}: {
  school_id: number;
  school: UpdateSchoolProps;
}) {
  const [state, formAction] = useActionState(updateCredentials, initialState);

  useEffect(() => {
    if (state.id) {
      toast.success("School Updated successfully");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex bg-gray-800 hover:bg-gray-700 text-white text-base font-medium px-4 py-2.5 outline-none rounded w-max cursor-pointer mx-auto">
          Update School Details
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update School Details</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          <Input name="school_id" defaultValue={school_id} type="hidden" />

          <div className="grid gap-2">
            <Label htmlFor="admin_name">Admin Name</Label>
            <Input
              name="admin_name"
              id="admin_name"
              placeholder="Admin Name"
              defaultValue={school.meta?.administrator_name || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin_phone">Admin Phone</Label>
            <Input
              name="admin_phone"
              id="admin_phone"
              placeholder="+254712345678"
              defaultValue={school.meta?.administrator_phone || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="terra_email">Terra Email</Label>
            <Input
              name="terra_email"
              id="terra_email"
              placeholder="terra@gmail.com"
              defaultValue={school.name || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="terra_password">Terra Password</Label>
            <Input
              name="terra_password"
              id="terra_password"
              type="password"
              placeholder="@Password2025"
              defaultValue={school.terra_password || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              name="location"
              id="location"
              placeholder="South B, Nairobi"
              defaultValue={school.location || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank_paybill_number">Bank Paybill Number</Label>
            <Input
              name="bank_paybill_number"
              id="bank_paybill_number"
              placeholder="247247"
              defaultValue={school.bank_paybill_number || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank_account_number">Bank Account Number</Label>
            <Input
              name="bank_account_number"
              id="bank_account_number"
              placeholder="1256478985"
              defaultValue={school.bank_account_number || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="commission_amount">Commission Amount</Label>
            <Input
              name="commission_amount"
              id="commission_amount"
              placeholder="100"
              type="number"
              defaultValue={school.commission_amount || ""}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="has_commission"
              id="has_commission"
              defaultChecked={school.has_commission}
            />
            <Label htmlFor="has_commission" className="cursor-pointer">
              Has Commission
            </Label>
          </div>

          <SubmitButton title="Update School" />
        </form>
        {state.message && (
          <p className="text-red-500 mt-2 text-center">{state.message}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
