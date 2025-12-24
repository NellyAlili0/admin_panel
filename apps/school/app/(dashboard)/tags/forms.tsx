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
import { addTag, updateTag, deleteTag } from "./actions";
import { initialState } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- ADD TAG FORM ---
interface AddTagFormProps {
  onTagAdded?: () => void;
  defaultEntity?: string;
}

export const AddTagForm = ({
  onTagAdded,
  defaultEntity = "dependant",
}: AddTagFormProps) => {
  const [state, action, isPending] = useActionState(addTag, initialState);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
      onTagAdded?.();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, onTagAdded]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-[#efb100] hover:bg-[#efaf008f] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus className="h-4 w-4" /> Create Tag
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Tag Name
            </label>
            <input
              required
              name="name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#efb100] outline-none"
              placeholder="e.g. Grade 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Entity Type
            </label>
            <select
              name="entity"
              defaultValue={defaultEntity}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#efb100] outline-none bg-white"
              required
            >
              <option value="dependant">Student (Dependant)</option>
              <option value="account">Parent (Account)</option>
              <option value="zone">Zone</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#efb100] outline-none resize-none"
              placeholder="Optional description"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#efb100] hover:bg-[#efaf008f] text-white py-2 rounded-lg mt-2 disabled:opacity-50 font-medium"
          >
            {isPending ? "Creating..." : "Create Tag"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- EDIT TAG FORM ---
interface EditTagFormProps {
  tag: any;
  onSuccess?: () => void;
}

export const EditTagForm = ({ tag, onSuccess }: EditTagFormProps) => {
  const [state, action, isPending] = useActionState(updateTag, initialState);
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
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Edit Tag"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Tag</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4 mt-2">
          <input type="hidden" name="id" value={tag.id} />
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Tag Name
            </label>
            <input
              required
              name="name"
              defaultValue={tag.name}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#efb100] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Entity Type
            </label>
            <select
              name="entity"
              defaultValue={tag.entity?.toLowerCase() || "dependant"}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#efb100] outline-none bg-white"
              required
            >
              <option value="dependant">Student (Dependant)</option>
              <option value="account">Parent (Account)</option>
              <option value="zone">Zone</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={tag.description}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#efb100] outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#efb100] hover:bg-[#efaf008f] text-white py-2 rounded-lg mt-2 disabled:opacity-50 font-medium"
          >
            {isPending ? "Updating..." : "Update Tag"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- DELETE TAG BUTTON ---
interface DeleteTagProps {
  tagId: string;
  tagName: string;
  onDelete?: () => void;
}

export const DeleteTagButton = ({
  tagId,
  tagName,
  onDelete,
}: DeleteTagProps) => {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteTag(tagId);
    if (res.success) {
      toast.success("Tag deleted successfully");
      setOpen(false);
      onDelete?.();
    } else {
      toast.error(res.message);
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Delete Tag"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" /> Delete Tag
          </DialogTitle>
          <DialogDescription className="py-2">
            Are you sure you want to delete the tag{" "}
            <strong>&quot;{tagName}&quot;</strong>? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end mt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
