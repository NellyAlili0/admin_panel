"use client";

import React, { useActionState, useEffect, useState } from "react";
import { uploadExcelAction } from "./actions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const initialState = {
  message: "",
  success: false,
  redirectTo: "/overview",
};

function UploadExcel({ schoolId }: { schoolId: number }) {
  const [state, formAction] = useActionState(uploadExcelAction, initialState);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (state.message) {
      setIsUploading(false); // ✅ reset uploading state when action resolves

      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <section className="w-fit shadow-md">
      <form
        action={async (formData) => {
          setIsUploading(true); // ✅ mark as uploading before submit
          return formAction(formData);
        }}
        className="flex flex-col items-center justify-center"
      >
        <label
          htmlFor="uploadFile1"
          className="flex bg-gray-800 hover:bg-gray-700 text-white text-base font-medium px-4 py-2.5 outline-none rounded w-max cursor-pointer mx-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 mr-2 fill-white inline"
            viewBox="0 0 32 32"
          >
            <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
            <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
          </svg>
          {isUploading ? "Uploading..." : "Upload Excel File"}
          <input
            type="file"
            id="uploadFile1"
            name="excel_file"
            className="hidden"
            required
            onChange={(e) => {
              if (e.currentTarget.form) {
                e.currentTarget.form.requestSubmit(); // 🔥 auto-submit form after picking file
              }
            }}
          />
        </label>

        <Input type="hidden" name="school_id" defaultValue={schoolId} />
      </form>
    </section>
  );
}

export default UploadExcel;
