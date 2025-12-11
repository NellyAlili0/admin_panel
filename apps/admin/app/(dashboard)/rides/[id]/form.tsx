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
import { Loader2, UserCog } from "lucide-react";
import { reassignSingleRide } from "./actions";
import { toast } from "sonner";

interface Driver {
  id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  vehicleId: number | null;
  vehicle_name: string | null;
  registration_number: string | null;
  available_seats: number | null;
  vehicle_status: string | null;
}

interface ReassignDriverDialogProps {
  currentDriverId: number | null;
  currentDriverName: string;
  rideId: number;
  availableDrivers: Driver[];
}

export function ReassignDriverDialog({
  currentDriverId,
  currentDriverName,
  rideId,
  availableDrivers,
}: ReassignDriverDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleReassign = async () => {
    if (!selectedDriverId) {
      toast("Please select a driver");
      return;
    }

    if (!currentDriverId) {
      toast("Current driver not found");
      return;
    }

    setIsLoading(true);

    try {
      const result = await reassignSingleRide({
        rideId,
        oldDriverId: currentDriverId,
        newDriverId: Number(selectedDriverId),
      });

      if (result.success) {
        toast(`${result.message}`);
        setOpen(false);
        router.refresh();
      } else {
        toast(`${result.message}`);
      }
    } catch (error) {
      toast("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out current driver from available drivers
  const filteredDrivers = availableDrivers.filter(
    (driver) => driver.id !== currentDriverId
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <UserCog className="mr-2 h-4 w-4" />
          Reassign Driver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reassign Driver</DialogTitle>
          <DialogDescription>
            Change the driver for this ride. The new driver's vehicle must have
            available seats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Driver</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{currentDriverName}</p>
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
                {filteredDrivers.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No available drivers with active vehicles
                  </div>
                ) : (
                  filteredDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{driver.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {driver.vehicle_name} ({driver.registration_number}) -
                          {driver.available_seats} seats available
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleReassign} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reassign Driver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
