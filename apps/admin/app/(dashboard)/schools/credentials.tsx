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
import { useRouter } from "next/navigation";
import { createCredentials } from "./actions_credentials";

interface SchoolCredentials {
  name: string;
  phone_number: string;
  school_id: number;
}

export function CreateSchoolCredentials({ data }: { data: SchoolCredentials }) {
  const router = useRouter();

  const [state, formAction] = useActionState(createCredentials, initialState);
  useEffect(() => {
    if (state.id) {
      toast.success("School credentials created successfully");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Create School Credentials</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create School Credentials</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-2">
          <Input
            name="name"
            placeholder="Name"
            required
            defaultValue={data.name}
            hidden
          />
          <Input name="email" placeholder="jane@gmail.com" required />

          {data.phone_number ? (
            <Input
              name="phone_number"
              placeholder="0712345667"
              required
              defaultValue={data.phone_number}
              hidden
            />
          ) : (
            <Input name="phone_number" placeholder="0712345667" required />
          )}

          <Input
            name="school_id"
            placeholder="1"
            required
            defaultValue={data.school_id}
            hidden
          />
          <Input name="password" placeholder="password" required />

          <SubmitButton title="Create" />
        </form>
        {state.message && (
          <p className="text-red-500 mt-2 text-center">{state.message}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
