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
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AddDriverForm = () => {
  const [state, action] = useActionState(addDriver, initialState);
  useEffect(() => {
    if (state.message) {
      toast.error(state.message)
    }
  }, [state])
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Add Driver</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Driver</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-2">
          <Input type="text" name="name" placeholder="Name" required />
          <Input type="email" name="email" placeholder="Email" required />
          <Input type="text" name="phone_number" placeholder="Phone Number" required />
          <Input type="password" name="password" placeholder="Password" required />
          <Input type="text" name="neighborhood" placeholder="Neighborhood" required />
          <Input type="text" name="county" placeholder="County" required />
          <SubmitButton title="Add Driver" />
        </form>
      </DialogContent>
    </Dialog>
  );
};
