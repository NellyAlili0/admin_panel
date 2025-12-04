"use client";

import { useActionState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { initialState } from "@/lib/utils";
import { editSubscription } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { toast } from "sonner";

export interface Subscription {
  id: number;
  total_paid: number;
  expiry_date: string;
  student_name: string;
}

export function EditSubscription({
  subscription,
}: {
  subscription: Subscription;
}) {
  const [state, formAction] = useActionState(editSubscription, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.message.includes("successfully")) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  // Convert expiry_date to YYYY-MM-DD format for input
  const formatDateForInput = (dateString: string) => {
    if (dateString === "N/A") return "";
    try {
      // Parse DD/MM/YYYY format
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
      }
      return "";
    } catch {
      return "";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Edit Subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Subscription - {subscription.student_name}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Input
            name="subscription_id"
            defaultValue={subscription.id}
            type="hidden"
          />

          <div className="grid gap-2">
            <Label htmlFor="total_paid">Total Paid (KES)</Label>
            <Input
              name="total_paid"
              id="total_paid"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount paid"
              defaultValue={subscription.total_paid}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              name="expiry_date"
              id="expiry_date"
              type="date"
              defaultValue={formatDateForInput(subscription.expiry_date)}
              required
            />
          </div>

          <SubmitButton title="Update Subscription" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
