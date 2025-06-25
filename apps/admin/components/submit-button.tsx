"use client";

import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
// import { Button } from './ui/button'

export function SubmitButton({ title }) {
  const { pending } = useFormStatus();

  return (
    <Button
      variant={pending ? "ghost" : "default"}
      type="submit"
      className="w-full text-white font-bold"
    >
      {pending ? <Loader className="animate-spin" /> : title}
    </Button>
  );
}
