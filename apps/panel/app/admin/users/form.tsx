"use client"

import { SubmitButton } from "@/components/submit-button";
import { addUser, updateUser } from "./actions"
import { useFormState } from "react-dom";
import { useActionState, useEffect } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";

interface MessageState {
    error: string | null;
    success: string | null;
}

export function Form() {
    const [state, formAction] = useActionState(addUser, null);
    useEffect(() => {

    }, [state?.errors])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button> Add User </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add User</DialogTitle>
                </DialogHeader>
                <form action={formAction}>
                    <div className="mb-4">
                        <label htmlFor="names" className="block text-sm font-medium text-gray-700">Names</label>
                        <input type="text" required name="names" id="names" className="mt-1 p-2 border rounded w-full" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" required name="email" id="email" className="mt-1 p-2 border rounded w-full" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" required name="password" id="password" className="mt-1 p-2 border rounded w-full" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select name="role" id="role" className="mt-1 p-2 border rounded w-full" defaultValue={"Operations"}>
                            <option value="Admin">Admin</option>
                            <option value="Finance">Finance</option>
                            <option value="Operations">Operations</option>
                        </select>
                    </div>
                    <SubmitButton title="Add User" />
                    {state?.errors && <p className="text-red-500 mt-2 text-center">{state.errors}</p>}
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function UpdateUserForm({ user }: { user: any }) {
    const [state, formAction] = useActionState(updateUser, null);
    useEffect(() => {

    }, [state?.errors])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size={"sm"}>Update User</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update User</DialogTitle>
                </DialogHeader>
                <form action={formAction}>
                    <input type="hidden" name="id" value={user.id} />
                    <div className="mb-4">
                        <label htmlFor="names" className="block text-sm font-medium text-gray-700">Names</label>
                        <input type="text" required name="names" defaultValue={user.name} id="names" className="mt-1 p-2 border rounded w-full" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" required name="email" defaultValue={user.email} id="email" className="mt-1 p-2 border rounded w-full" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                        <select name="role" id="role" className="mt-1 p-2 border rounded w-full" defaultValue={user.role}>
                            <option value="Admin">Admin</option>
                            <option value="Finance">Finance</option>
                            <option value="Operations">Operations</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" id="status" className="mt-1 p-2 border rounded w-full" defaultValue={user.status}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <SubmitButton title="Update User" />
                    {state?.errors && <p className="text-red-500 mt-2 text-center">{state.errors}</p>}
                </form>
            </DialogContent>
        </Dialog>
    )
}
