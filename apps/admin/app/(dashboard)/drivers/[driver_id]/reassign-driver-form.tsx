"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2, UserX, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { reassignAllDriverRides } from "./reassign-driver-actions";

interface Driver {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  balance: number | null;
  verified: string;
}

interface BulkReassignDialogProps {
  drivers: Driver[];
  currentDriverId: number;
  currentDriverName: string | null;
  activeRidesCount: number;
}

export function BulkReassignDialog({
  drivers,
  currentDriverId,
  currentDriverName,
  activeRidesCount,
}: BulkReassignDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const router = useRouter();

  const handleReassign = async () => {
    if (!selectedDriverId) {
      toast("Please select a driver");
      return;
    }

    setIsLoading(true);

    try {
      const result = await reassignAllDriverRides({
        oldDriverId: currentDriverId,
        newDriverId: Number(selectedDriverId),
      });

      if (result.success) {
        toast(result.message);
        setOpen(false);
        setConfirmationStep(false);
        router.refresh();
      } else {
        toast(result.message);
      }
    } catch (error) {
      toast("Failed to reassign rides");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDriver = drivers.find((d) => d.id === Number(selectedDriverId));

  // Filter out current driver
  const availableDrivers = drivers.filter((d) => d.id !== currentDriverId);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setConfirmationStep(false);
          setSelectedDriverId("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <UserX className="mr-2 h-4 w-4" />
          Reassign All Rides
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {confirmationStep ? "Confirm Reassignment" : "Reassign All Rides"}
          </DialogTitle>
          <DialogDescription>
            {confirmationStep
              ? "Please confirm you want to proceed with this bulk reassignment."
              : `Reassign all active rides from ${currentDriverName} to another driver.`}
          </DialogDescription>
        </DialogHeader>

        {!confirmationStep ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-medium text-yellow-900">Warning</h5>
                  <div className="text-sm text-yellow-800">
                    This will reassign all {activeRidesCount} active rides from
                    this driver. This action will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Update all ride and daily_ride records</li>
                      <li>Update vehicle seat availability</li>
                      <li>Notify all affected parents and drivers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Driver</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{currentDriverName}</p>
                <p className="text-xs text-muted-foreground">
                  {activeRidesCount} active rides
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-driver">New Driver</Label>
              <Select
                value={selectedDriverId}
                onValueChange={setSelectedDriverId}
              >
                <SelectTrigger id="new-driver">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No other drivers available
                    </div>
                  ) : (
                    availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{driver.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {driver.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-medium text-red-900">
                    Final Confirmation
                  </h5>
                  <div className="text-sm text-red-800">
                    You are about to reassign{" "}
                    <strong>{activeRidesCount} rides</strong> from{" "}
                    <strong>{currentDriverName}</strong> to{" "}
                    <strong>{selectedDriver?.name}</strong>.
                    <br />
                    <br />
                    This action cannot be undone automatically. Are you sure you
                    want to proceed?
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (confirmationStep) {
                setConfirmationStep(false);
              } else {
                setOpen(false);
              }
            }}
            disabled={isLoading}
          >
            {confirmationStep ? "Back" : "Cancel"}
          </Button>
          {!confirmationStep ? (
            <Button
              onClick={() => setConfirmationStep(true)}
              disabled={!selectedDriverId}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleReassign}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reassignment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
