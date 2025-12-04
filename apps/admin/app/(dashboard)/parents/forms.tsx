"use client";

import { useActionState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { initialState } from "@/lib/utils";
import {
  addStudent,
  createParent,
  linkSchool,
  sendNotification,
} from "./action";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { School } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

// Define minimal School interface
interface School {
  id: number;
  name: string;
}

export function CreateParent() {
  const [state, formAction] = useActionState(createParent, initialState);

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
        <Button variant="default">Create Parent</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Parent</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input name="name" id="name" placeholder="Name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              name="email"
              id="email"
              type="email"
              placeholder="Email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              name="phone_number"
              id="phone_number"
              placeholder="Phone Number"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              name="password"
              id="password"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <SubmitButton title="Create Parent Account" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SendNotificationForm({ parentId }: { parentId: string }) {
  const [state, formAction] = useActionState(sendNotification, initialState);

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
        <Button variant="default">Send Notification</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-2">
          {/* Fix: Use defaultValue instead of value, or make it readOnly */}
          <Input name="parent_id" defaultValue={parentId} type="hidden" />
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input name="title" id="title" placeholder="Title" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="body">Message</Label>
            <Input name="body" id="body" placeholder="Message" required />
          </div>
          <SubmitButton title="Send Notification" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
        <Button variant="default">Add Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-2">
          {/* Fix: Use defaultValue instead of value, or make it readOnly */}
          <Input name="parent_id" defaultValue={parentId} type="hidden" />
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input name="name" id="name" placeholder="Name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select name="gender" required>
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
            <Input name="address" id="address" placeholder="Address" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="service_type">Service Type</Label>
            <Select name="service_type" required>
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
              placeholder="daily fee (optional)"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transport_term_fee">Transport Term Fee</Label>
            <Input
              name="transport_term_fee"
              id="transport_term_fee"
              placeholder="Transport Term Fee (optional)"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="comments">Comments</Label>
            <Input
              name="comments"
              id="comments"
              placeholder="Comments (optional)"
            />
          </div>
          <SubmitButton title="Add Student" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LinkSchoolDialog({
  studentId,
  schools,
}: {
  studentId: string;
  schools: School[];
}) {
  const [state, formAction] = useActionState(linkSchool, initialState);

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
        <Button variant="outline" size="sm">
          <School className="h-4 w-4 mr-2" />
          Link School
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link to School</DialogTitle>
          <DialogDescription>
            Connect this student profile to a school in the system.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-2">
          {/* Fix: Use defaultValue instead of value, or make it readOnly */}
          <Input name="student_id" defaultValue={studentId} type="hidden" />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="school_id">Select School</Label>
              <Select name="school_id" required>
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
          </div>
          <DialogFooter>
            <SubmitButton title="Link School" />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
