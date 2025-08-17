"use client";

import { useState } from "react";
import { submitKYC } from "./actions";

interface KYCFormProps {
  driverId: number;
  onSubmitted?: () => void;
}

export default function KYCForm({ driverId, onSubmitted }: KYCFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    formData.append("driver_id", driverId.toString());

    try {
      const result = await submitKYC(null, formData); // ✅ Direct server action call
      setMessage("✅ KYC submitted successfully");
      if (onSubmitted) onSubmitted();
    } catch (error: any) {
      setMessage("❌ Failed to submit KYC");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-10 my-6">
        <FileInput
          label="National ID Front"
          name="national_id_front"
          required={false}
        />
        <FileInput
          label="National ID Back"
          name="national_id_back"
          required={false}
        />
        <FileInput
          label="Passport Photo"
          name="passport_photo"
          required={false}
        />
        <FileInput
          label="Driving License"
          name="driving_license"
          required={false}
        />
        <FileInput
          label="Certificate of Good Conduct"
          name="certificate_of_good_conduct"
          required={false}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-[150px] py-2 mt-4 px-4 bg-[#efb100] hover:bg-[#efaf00de] text-white font-medium rounded-lg disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit KYC"}
      </button>

      {message && (
        <div
          className={`text-sm mt-5 ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}

function FileInput({
  label,
  name,
  required = false, // default false
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="file"
        id={name}
        name={name}
        required={required} // ✅ now controlled
        className="block w-full text-sm text-gray-800 file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-[#efaf0050] file:text-gray-800
          hover:file:bg-[#efaf00b7] mt-3"
      />
    </div>
  );
}
