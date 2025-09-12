"use client";

import { Loader } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "../../admin/components/ui/button";

export function LoginButton({ title }) {
  const { pending } = useFormStatus();

  return (
    <Button
      variant={pending ? "ghost" : "default"}
      type="submit"
      className="w-full bg-[#efb100] text-white py-2 px-4 rounded-md hover:bg-[#b88600] focus:outline-none focus:ring-2 focus:ring-[#b88600] focus:ring-offset-2 transition duration-150"
    >
      {pending ? <Loader className="animate-spin" /> : title}
    </Button>
  );
}
