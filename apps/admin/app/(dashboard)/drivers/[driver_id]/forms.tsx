"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionState } from "react";
import {
  markVerified,
  addVehicle,
  editDriver,
  changePassword,
} from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const initialState = {
  message: "",
  success: false,
  redirectTo: "/overview",
};

export function MarkVerifiedForm({ driver_id }: { driver_id: string }) {
  const [state, formAction] = useActionState(markVerified, initialState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setOpen(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Mark as Verified</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Driver as Verified</DialogTitle>
          <p>This action cannot be undone</p>
        </DialogHeader>
        <form action={formAction}>
          <Input type="hidden" name="driver_id" defaultValue={driver_id} />
          <SubmitButton title="Mark as Verified" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddVehicleForm({ driver_id }: { driver_id: string }) {
  const [state, formAction] = useActionState(addVehicle, initialState);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setOpen(false);
        // Handle redirect if provided
        if (state.redirectTo) {
          router.push(state.redirectTo);
        } else {
          // Refresh the page to show the new vehicle
          window.location.reload();
        }
      } else {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  // Add form validation
  const handleSubmit = async (formData: FormData) => {
    try {
      console.log(
        "Submitting vehicle form with data:",
        Object.fromEntries(formData)
      );
      await formAction(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add Vehicle</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-2">
          <Input type="hidden" name="driver_id" defaultValue={driver_id} />
          <Input
            type="text"
            name="vehicle_name"
            placeholder="Vehicle Name"
            required
          />
          <Input
            type="text"
            name="registration_number"
            placeholder="Registration Number"
            required
          />
          <Input
            type="text"
            name="vehicle_model"
            placeholder="Vehicle Model"
            required
          />
          <Input
            type="number"
            name="vehicle_year"
            placeholder="Vehicle Year"
            min="1900"
            max="2030"
            required
          />
          <Input
            type="number"
            name="seat_count"
            placeholder="Seat Count"
            min="1"
            max="50"
            required
          />
          <Select name="vehicle_type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bus">Bus</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Car">Car</SelectItem>
            </SelectContent>
          </Select>
          <Select name="is_inspected" required>
            <SelectTrigger>
              <SelectValue placeholder="Select Inspection Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Inspected</SelectItem>
              <SelectItem value="false">Not Inspected</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            name="comments"
            placeholder="Comments (optional)"
          />
          <SubmitButton title="Add Vehicle" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const EditDriverForm = ({ driver }: { driver: any }) => {
  const [state, action] = useActionState(editDriver, initialState);
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
        <Button variant="default">Edit Driver</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-2">
          <Input type="hidden" name="driver_id" defaultValue={driver.id} />
          <Input
            type="text"
            name="name"
            defaultValue={driver.name}
            placeholder="Name"
            required
          />
          <Input
            type="email"
            name="email"
            defaultValue={driver.email}
            placeholder="Email"
            required
          />
          <Input
            type="tel"
            name="phone_number"
            defaultValue={driver.phone_number}
            placeholder="Phone Number"
            required
          />
          <Input
            type="text"
            name="neighborhood"
            defaultValue={driver.meta?.neighborhood}
            placeholder="Neighborhood"
            required
          />
          <Input
            type="text"
            name="county"
            defaultValue={driver.meta?.county}
            placeholder="County"
            required
          />
          <SubmitButton title="Edit Driver" />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const ChangePasswordForm = ({ driver }: { driver: any }) => {
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
          <Input type="hidden" name="driver_id" defaultValue={driver.id} />
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
