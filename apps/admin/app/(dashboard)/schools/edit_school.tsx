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
import { SubmitButton } from "@/components/submit-button";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateCredentials } from "./edit_school_actions";

export function UpdateSchool({ school_id }: { school_id: number }) {
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
        <form action={formAction} className="flex flex-col gap-2">
          <Input name="admin_name" placeholder="admin" />
          <Input name="admin_phone" placeholder="+254712345678" />
          <Input name="terra_email" placeholder="terra@gmail.com" />
          <Input name="terra_password" placeholder="@Password2025" />

          <Input
            name="school_id"
            placeholder="1"
            required
            defaultValue={school_id}
            hidden
          />

          <SubmitButton title="Update" />
        </form>
        {state.message && (
          <p className="text-red-500 mt-2 text-center">{state.message}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
