"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { markAsInspected } from "./actions";
import { useActionState } from "react";
import { initialState } from "@/lib/utils";

export const MarkAsInspected = ({ plate }: { plate: string }) => {
  const [state, formAction] = useActionState(markAsInspected, initialState);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Mark as Inspected</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Inspected</DialogTitle>
          <p> This action cannot be undone </p>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="plate" value={plate} />
          <Button type="submit">Mark as Inspected</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
