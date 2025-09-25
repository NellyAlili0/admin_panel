"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, AlertCircle } from "lucide-react";

interface DownloadReportProps {
  smartCardUrl: string;
  fileName?: string;
}

export default function DownloadReport({
  smartCardUrl,
  fileName = "school-report.xlsx",
}: DownloadReportProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      if (!smartCardUrl || smartCardUrl.trim() === "") {
        throw new Error("No download URL provided");
      }

      const urlObj = new URL(smartCardUrl);
      const fileKey = urlObj.pathname.replace(/^\/+/, "");
      // e.g. "reports/06a48a00-ac63-45c5-b319-936ac1e0c9af.csv"

      // 👇 Do NOT encode the `/` — backend expects [...file]
      const response = await fetch(`/api/download/${fileKey}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch file (${response.status})`);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Triggers the download
      } else {
        throw new Error("Download Failed");
      }
    } catch (error) {
      console.error("Download failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to download file"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-lg mx-auto border border-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-50 rounded-full mb-6">
          <FileSpreadsheet className="w-10 h-10 text-[#efb100]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          📊 SmartCard Report
        </h1>
        <p className="text-lg text-gray-600">
          Download the latest school Excel report
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-2 mb-8 flex items-center justify-center gap-3 w-3/4 mx-auto">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 text-sm font-medium text-center">
              Download Failed: {error}
            </p>
          </div>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center justify-center gap-3 w-3/4 mx-auto bg-gradient-to-r from-[#efb100] to-[#d99f00] hover:from-[#d99f00] hover:to-[#c28f00] disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-3 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:hover:transform-none disabled:cursor-not-allowed text-lg"
        aria-label={
          isDownloading ? "Downloading report..." : "Download school report"
        }
      >
        {isDownloading ? (
          <>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <Download className="w-6 h-6" />
            <span>Download Report</span>
          </>
        )}
      </button>

      {/* File Info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">File: {fileName} • Excel format</p>
      </div>
    </div>
  );
}
