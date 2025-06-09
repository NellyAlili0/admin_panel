"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useActionState } from "react"
import { initialState } from "@/lib/utils"
import { create } from "./actions"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/submit-button"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"


export function CreateSchool() {
    const [state, formAction] = useActionState(create, initialState)
    useEffect(() => {
        if (state.message) {
            toast.error(state.message)
        }
    }, [state])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default">Create School</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create School</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="flex flex-col gap-2">
                    <Input name="name" placeholder="Name" required />
                    <Input name="location" placeholder="Location" required />
                    <Input name="comments" placeholder="Comments" />
                    <Input name="longitude" type="text" placeholder="Longitude" required />
                    <Input name="latitude" type="text" placeholder="Latitude" required />
                    <Input name="administratorName" placeholder="Administrator Name" required />
                    <Input name="administratorPhone" placeholder="Administrator Phone" required />
                    <SubmitButton title="Create" />
                </form>
                {state.message && (
                    <p className="text-red-500 mt-2 text-center">{state.message}</p>
                )}
            </DialogContent>
        </Dialog>
    )
}