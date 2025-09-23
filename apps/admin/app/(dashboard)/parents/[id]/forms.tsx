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
import { changePassword, editParent } from "./actions";

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
        <Button variant="default">Edit Parent</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Parent</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-2">
          <Input type="hidden" name="parent_id" defaultValue={parent.id} />
          <Input
            type="text"
            name="name"
            defaultValue={parent.name}
            placeholder="Name"
            required
          />
          <Input
            type="email"
            name="email"
            defaultValue={parent.email}
            placeholder="Email"
            required
          />
          <Input
            type="tel"
            name="phone_number"
            defaultValue={parent.phone_number}
            placeholder="Phone Number"
            required
          />
          <SubmitButton title="Edit Parent" />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const ChangePasswordForm = ({ parent }: { parent: any }) => {
  const [state, action] = useActionState(changePassword, initialState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setOpen(false);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Change Password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-2">
          <Input type="hidden" name="parent_id" defaultValue={parent.id} />
          <Input
            type="password"
            name="password"
            placeholder="New Password"
            required
            minLength={6}
          />
          <SubmitButton title="Change Password" />
        </form>
      </DialogContent>
    </Dialog>
  );
};
