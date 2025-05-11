"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useActionState } from "react"
import { initialState } from "@/lib/utils"
import { markVerified } from "./actions"
import { SubmitButton } from "@/components/submit-button"
import { useEffect } from "react"

export function MarkVerifiedForm({ driver_id }: { driver_id: string }) {
    const [state, formAction] = useActionState(markVerified, initialState)
    useEffect(() => {
        if (state.message) {
            console.log(state.message)
        }
    }, [state])
    return (
        <Dialog>
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
    )
}