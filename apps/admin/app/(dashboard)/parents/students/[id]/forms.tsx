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
import { editStudent } from "./action";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gender, ServiceType } from "@/database/schema";

export interface Student {
  id: number;
  schoolId: number | null;
  parentId: number | null;
  name: string;
  profile_picture: string | null;
  gender: Gender;
  address: string | null;
  comments: string | null;
  daily_fee: number | null;
  transport_term_fee: number | null;
  service_type: ServiceType | null;
}

export interface School {
  id: number;
  name: string;
}

export function EditStudent({
  student,
  parentId,
  schools,
}: {
  student: Student;
  parentId: number;
  schools: School[];
}) {
  const [state, formAction] = useActionState(editStudent, initialState);

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
        <Button variant="default">Edit Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-2">
          <Input name="student_id" defaultValue={student.id} type="hidden" />
          <Input name="parent_id" defaultValue={parentId} type="hidden" />

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              name="name"
              id="name"
              placeholder="Name"
              defaultValue={student.name}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select name="gender" defaultValue={student.gender} required>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              name="address"
              id="address"
              placeholder="Address"
              defaultValue={student.address || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service_type">Service Type</Label>
            <Select
              name="service_type"
              defaultValue={student.service_type || undefined}
              required
            >
              <SelectTrigger id="service_type">
                <SelectValue placeholder="Select Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="carpool">Carpool</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="daily_fee">Daily Fee</Label>
            <Input
              name="daily_fee"
              id="daily_fee"
              placeholder="Daily fee"
              defaultValue={student.daily_fee || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transport_term_fee">Transport Term Fee</Label>
            <Input
              name="transport_term_fee"
              id="transport_term_fee"
              placeholder="Transport Term Fee"
              defaultValue={student.transport_term_fee || ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="school_id">Select School</Label>
            <Select
              name="school_id"
              defaultValue={student.schoolId?.toString() || undefined}
            >
              <SelectTrigger id="school_id">
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id.toString()}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SubmitButton title="Update Student" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateSubscription({
  studentId,
  studentName,
}: {
  studentId: number;
  studentName: string;
}) {
  const [state, formAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const { createSubscription } = await import("./action");
      return createSubscription(prevState, formData);
    },
    initialState
  );

  useEffect(() => {
    if (state.message) {
      if (state.message.includes("successfully")) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default"> Create Subscription</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Subscription - {studentName}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Input name="student_id" defaultValue={studentId} type="hidden" />

          <div className="grid gap-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              name="start_date"
              id="start_date"
              type="date"
              defaultValue={today}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              name="expiry_date"
              id="expiry_date"
              type="date"
              defaultValue={today}
              required
            />
          </div>

          <SubmitButton title="Create Subscription" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
