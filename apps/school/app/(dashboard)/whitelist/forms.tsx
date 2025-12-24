"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  addToWhitelist,
  removeFromWhitelist,
  fetchZones,
  fetchTags,
} from "./actions";
import { initialState } from "@/lib/utils";
import { toast } from "sonner";
import { Trash2, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// --- ADD WHITELIST FORM ---
interface AddWhitelistFormProps {
  onSuccess?: () => void;
}

export const AddWhitelistForm = ({ onSuccess }: AddWhitelistFormProps) => {
  const [state, action, isPending] = useActionState(
    addToWhitelist,
    initialState
  );
  const [open, setOpen] = useState(false);

  // Data State
  const [zones, setZones] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [entityType, setEntityType] = useState("dependant");
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  // Load Zones on Open
  useEffect(() => {
    if (open) {
      setLoadingZones(true);
      fetchZones()
        .then(setZones)
        .finally(() => setLoadingZones(false));
    }
  }, [open]);

  // Load Tags when Entity Changes
  useEffect(() => {
    if (open) {
      setLoadingTags(true);
      fetchTags(entityType)
        .then(setTags)
        .finally(() => setLoadingTags(false));
    }
  }, [open, entityType]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
      onSuccess?.();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-[#efb100] hover:bg-[#efaf008f] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <ShieldCheck className="h-4 w-4" /> Add Access Rule
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Grant Access to Zone</DialogTitle>
          <DialogDescription>
            Select a zone and a tag to whitelist. Users with this tag will be
            allowed to check-in.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4 mt-4">
          {/* ZONE SELECTION */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Select Zone
            </label>
            {loadingZones ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 p-2 border rounded">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading zones...
              </div>
            ) : (
              <Select name="zone_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a zone..." />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* ENTITY TYPE SELECTION */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Entity Type
            </label>
            <Select
              name="entity"
              value={entityType}
              onValueChange={setEntityType}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dependant">Student (Dependant)</SelectItem>
                <SelectItem value="account">Parent (Account)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TAG SELECTION */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Select Tag
            </label>
            {loadingTags ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 p-2 border rounded">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading tags...
              </div>
            ) : (
              <Select name="tag_uuid" required>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose a ${entityType} tag...`} />
                </SelectTrigger>
                <SelectContent>
                  {tags.length > 0 ? (
                    tags.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                      No tags found
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || loadingZones || loadingTags}
            className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white py-2 rounded-lg mt-2 disabled:opacity-50 font-medium"
          >
            {isPending ? "Saving..." : "Grant Access"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- REMOVE RULE BUTTON ---
interface RemoveRuleProps {
  zoneId: string;
  tagId: string;
  description: string;
  onSuccess?: () => void;
}

export const RemoveWhitelistButton = ({
  zoneId,
  tagId,
  description,
  onSuccess,
}: RemoveRuleProps) => {
  const [state, action, isPending] = useActionState(
    removeFromWhitelist,
    initialState
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success("Access revoked");
      setOpen(false);
      onSuccess?.();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Revoke Access"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" /> Revoke Access
          </DialogTitle>
          <DialogDescription className="py-2">
            Are you sure you want to remove <strong>{description}</strong>?
            Users with this tag will no longer be able to check in to this zone.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="zone_id" value={zoneId} />
          <input type="hidden" name="tag_uuid" value={tagId} />
          <DialogFooter className="flex gap-2 justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? "Revoking..." : "Revoke Access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
