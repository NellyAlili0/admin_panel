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
import {
  markVerified,
  addVehicle,
  editDriver,
  changePassword,
} from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { useEffect } from "react";
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

export function MarkVerifiedForm({ driver_id }: { driver_id: string }) {
  const [state, formAction] = useActionState(markVerified, initialState);
  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Mark as Verified</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Driver as Verified</DialogTitle>
          <p>This action cannot be undone</p>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="driver_id" value={driver_id} />
          <SubmitButton title="Mark as Verified" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddVehicleForm({ driver_id }: { driver_id: string }) {
  const [state, formAction] = useActionState(addVehicle, initialState);
  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Add Vehicle</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="driver_id" value={driver_id} />
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
            type="text"
            name="vehicle_year"
            placeholder="Vehicle Year"
            required
          />
          <Input
            type="text"
            name="seat_count"
            placeholder="Seat Count"
            required
          />
          <Select name="vehicle_type">
            <SelectTrigger>
              <SelectValue placeholder="Select Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bus">Bus</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Car">Car</SelectItem>
            </SelectContent>
          </Select>
          <Select name="is_inspected">
            <SelectTrigger>
              <SelectValue placeholder="Select Inspection Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Inspected</SelectItem>
              <SelectItem value="false">Not Inspected</SelectItem>
            </SelectContent>
          </Select>
          <Input type="text" name="comments" placeholder="Comments" required />
          <SubmitButton title="Add Vehicle" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const EditDriverForm = ({ driver }: { driver: any }) => {
  const [state, action] = useActionState(editDriver, initialState);
  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Edit Driver</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-2">
          <input type="hidden" name="driver_id" value={driver.id} />
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
            type="text"
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
  useEffect(() => {
    if (state.message) {
      toast.error(state.message);
    }
  }, [state]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Change Password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-2">
          <input type="hidden" name="driver_id" value={driver.id} />
          <Input
            type="password"
            name="password"
            placeholder="New Password"
            required
          />
          <SubmitButton title="Change Password" />
        </form>
      </DialogContent>
    </Dialog>
  );
};
