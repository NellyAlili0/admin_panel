"use client"

import { SubmitButton } from "@/components/submit-button";
import { addUser, searchDriver, updateUser } from "./actions"
import { useFormState } from "react-dom";
import { useActionState, useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

interface MessageState {
    error: string | null;
    success: string | null;
}

export function DriverTXForm() {
    const [state, formAction] = useActionState(addUser, null);
    const [rides, setRides] = useState<any>(null)
    const [driverAccount, setDriverAccount] = useState('')
    const [driver, setDriver] = useState<any>(null)
    const [error, setError] = useState('')
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" size={"sm"}> Add Driver TX </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Driver Earning Transaction </DialogTitle>
                </DialogHeader>
                <form action={formAction}>
                    <div className="mb-2">
                        <label htmlFor="account" className="block text-sm font-medium text-gray-700"> Email / Phone </label>
                        <div className="flex gap-2 items-center">
                            <Input type="text" required name="account" id="account" defaultValue={driverAccount} onChange={(e) => setDriverAccount(e.target.value)} className="mt-1 p-2 border rounded w-full" />
                            <Button variant="default" type="button" onClick={async () => {
                                if (driverAccount.length > 5) {
                                    let resp = await searchDriver({ account: driverAccount })
                                    if (resp) {
                                        setRides(resp.activeRide)
                                        setDriver(resp.driver)
                                        setError('')
                                    }
                                    else {
                                        setError('Driver not found')
                                    }
                                }
                            }} size={"sm"}>Search Account</Button>
                        </div>
                    </div>
                    {rides && (
                        <div>
                            <div className="mb-2">
                                <label htmlFor="ride" className="block text-sm font-medium text-gray-700">Ride</label>
                                <select name="ride" id="ride" className="mt-1 p-2 border rounded w-full">
                                    {rides.map((ride) => (
                                        <option key={ride.id} value={ride.id}>
                                            {ride.comments}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-xs border rounded p-2">
                                <div className="flex items-center justify-between">
                                    <h1 className="text-gray-500"> Names </h1>
                                    <p>{driver?.first_name} {driver?.last_name}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <h1 className="text-gray-500"> Bank </h1>
                                    <p>{driver?.meta?.payout?.bank}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <h1 className="text-gray-500"> Account Number </h1>
                                    <p>{driver?.meta?.payout?.account_number}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <h1 className="text-gray-500"> Account Name </h1>
                                    <p>{driver?.meta?.payout?.account_name}</p>
                                </div>
                            </div>
                            <input type="hidden" name="driver_id" value={driver?.id} />
                            <div className="mb-2">
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                                <input type="number" required name="amount" id="amount" className="mt-1 p-2 border rounded w-full" />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Comments</label>
                                <input type="text" required name="comments" id="comments" className="mt-1 p-2 border rounded w-full" />
                            </div>
                            <div className="mb-2">
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Payment Method</label>
                                <select name="role" id="role" className="mt-1 p-2 border rounded w-full" defaultValue={"Cash"}>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <SubmitButton title="Add Payment" />
                            <small className="text-center text-gray-500 text-xs"> The driver will be notified </small>
                        </div>
                    )}
                    {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function RideTXForm() {
    const [state, formAction] = useActionState(updateUser, null);
    useEffect(() => {

    }, [state?.errors])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" size={"sm"}>Add Ride Bill </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Ride Bill </DialogTitle>
                </DialogHeader>
                <form action={formAction}>

                    <SubmitButton title="Add Ride Bill" />
                    {state?.errors && <p className="text-red-500 mt-2 text-center">{state.errors}</p>}
                </form>
            </DialogContent>
        </Dialog>
    )
}
