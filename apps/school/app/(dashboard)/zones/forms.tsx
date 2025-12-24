"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addZone, whitelistTag, addZoneTag, getSchoolTags } from "./actions";
import { initialState } from "@/lib/utils";
import { toast } from "sonner";
import { PlusCircle, ShieldCheck, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- EXISTING ADD ZONE FORM ---
interface AddZoneFormProps {
  onZoneAdded?: () => void;
}

export const AddZoneForm = ({ onZoneAdded }: AddZoneFormProps) => {
  const [state, action, isPending] = useActionState(addZone, initialState);
  const [open, setOpen] = useState(false);
  const [lastProcessedState, setLastProcessedState] = useState<any>(null);

  useEffect(() => {
    if (state === lastProcessedState || state === initialState) return;
    if (state?.message) {
      if (state?.success) {
        toast.success(state.message);
        setOpen(false);
        setLastProcessedState(state);
        onZoneAdded?.();
      } else {
        toast.error(state.message);
        setLastProcessedState(state);
      }
    }
  }, [state, lastProcessedState, onZoneAdded]);

  useEffect(() => {
    if (!open) setLastProcessedState(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex bg-[#efb100] hover:bg-[#efaf008f] text-white text-base font-medium px-6 py-2 outline-none rounded w-max cursor-pointer mx-auto">
          Add Zone
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 text-gray-800">
            Create Zone
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                required
                type="text"
                name="name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300"
                placeholder="e.g. Westlands"
                disabled={isPending}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone Type
              </label>
              <select
                required
                name="type"
                defaultValue="standard"
                className="w-full px-4 py-3 rounded-lg border border-gray-300"
                disabled={isPending}
              >
                <option value="standard">Standard Zone</option>
                <option value="school">School Zone (Default)</option>
                <option value="other">Other (Requires Input)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="note"
                className="w-full px-4 py-3 rounded-lg border border-gray-300"
                placeholder="Description"
                disabled={isPending}
              />
            </div>
          </div>
          <div className="mt-8">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-medium py-3 px-4 rounded-lg"
            >
              {isPending ? "Creating..." : "Create Zone"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- UPDATED WHITELIST FORM (With Dropdown) ---
interface WhitelistFormProps {
  zoneId: string;
  entityType: "account" | "dependant";
  onSuccess?: () => void;
}

export const WhitelistForm = ({
  zoneId,
  entityType,
  onSuccess,
}: WhitelistFormProps) => {
  const [state, action, isPending] = useActionState(whitelistTag, initialState);
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // Fetch tags when dialog opens
  useEffect(() => {
    if (open) {
      setLoadingTags(true);
      getSchoolTags(entityType)
        .then((data) => setTags(data))
        .catch(() => toast.error("Failed to load tags"))
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

  const title =
    entityType === "account"
      ? "Whitelist Parent Groups"
      : "Whitelist Student Groups";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Whitelist
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4 mt-4">
          <input type="hidden" name="zone_id" value={zoneId} />
          <input type="hidden" name="entity" value={entityType} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Tag to Whitelist
            </label>
            {loadingTags ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 border p-2 rounded">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading tags...
              </div>
            ) : (
              <Select name="tag_uuid" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a tag..." />
                </SelectTrigger>
                <SelectContent>
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No tags found
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Adding this tag will allow all {entityType}s with this tag to
              access the zone.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending || loadingTags}
            className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-bold py-2 px-4 rounded-md mt-4 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Whitelist Tag"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- ZONE TAG FORM (Matches Screenshot 5) ---
interface ZoneTagFormProps {
  zoneId: string;
  onSuccess?: () => void;
}

export const ZoneTagForm = ({ zoneId, onSuccess }: ZoneTagFormProps) => {
  const [state, action, isPending] = useActionState(addZoneTag, initialState);
  const [open, setOpen] = useState(false);

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
        <button className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-1">
          <PlusCircle className="h-3 w-3" /> Add Tag
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add Tag to Zone
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4 mt-4">
          <input type="hidden" name="zone_id" value={zoneId} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="tag_uuid"
              placeholder="Type to search..."
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-red-400 mt-1">
              At least one tag is required
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#efb100] hover:bg-[#efaf00a8] text-white font-bold py-2 px-4 rounded-md mt-4"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
