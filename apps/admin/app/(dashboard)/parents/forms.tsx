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

export function CreateParent() {
  const [state, formAction] = useActionState(createParent, initialState);
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
          <Input name="name" placeholder="Name" required />
          <Input name="email" placeholder="Email" required />
          <Input name="phone_number" placeholder="Phone Number" required />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <SubmitButton title="Create Parent Account" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SendNotificationForm({ parent_id }: { parent_id: string }) {
  const [state, formAction] = useActionState(sendNotification, initialState);
  useEffect(() => {
    if (state.message) {
      toast.error(state.message)
    }
  }, [state])
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
          <Input name="parent_id" value={parent_id} hidden />
          <Input name="title" placeholder="Title" required />
          <Input name="body" placeholder="Body" required />
          <SubmitButton title="Send Notification" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddStudentForm({ parent_id }: { parent_id: string }) {
  const [state, formAction] = useActionState(addStudent, initialState);
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
          <Input name="parent_id" value={parent_id} hidden />
          <Input name="name" placeholder="Name" required />
          <Select name="gender">
            <SelectTrigger>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Input name="address" placeholder="Address" required />
          <Input name="comments" placeholder="Comments" />
          <SubmitButton title="Add Student" />
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Link School Dialog Component
export function LinkSchoolDialog({
  student_id,
  schools,
}: {
  student_id: string;
  schools: any;
}) {
  const [state, formAction] = useActionState(linkSchool, initialState);
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
          <Input name="student_id" value={student_id} hidden />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="school">Select School</Label>
              <Select name="school_id">
                <SelectTrigger id="school">
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school: any) => (
                    <SelectItem key={school.id} value={school.id}>
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
