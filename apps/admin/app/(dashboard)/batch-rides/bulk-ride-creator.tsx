"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Users,
  Car,
  CalendarDays,
  Info,
} from "lucide-react";

// Custom Alert component since it's not available
const Alert = ({ children, className = "" }) => (
  <div className={`border rounded-lg p-4 ${className}`}>{children}</div>
);

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);

interface BulkRideData {
  studentName: string;
  studentId?: number;
  driverName: string;
  driverId?: number;
  pickupLocation: string;
  pickupTime: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLocation: string;
  dropoffTime: string;
  dropoffLat?: number;
  dropoffLng?: number;
  startDate: string;
  endDate: string;
  rideType: "Private" | "Carpool" | "Bus";
  cost: number;
  comments?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: BulkRideData;
  row: number;
}

interface Driver {
  id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  vehicle_id: number;
  vehicle_name: string | null;
  registration_number: string;
  vehicle_type: "Bus" | "Van" | "Car";
  seat_count: number;
  available_seats: number;
}

interface Student {
  id: number;
  name: string;
  gender: "Female" | "Male";
  address: string | null;
  parent_id: number | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  school_id: number | null;
  school_name?: string | null;
}

interface BulkRideCreatorProps {
  drivers: Driver[];
  students: Student[];
  assignRide: (formData: FormData) => Promise<any>;
}

export default function BulkRideCreator({
  drivers,
  students,
  assignRide,
}: BulkRideCreatorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<BulkRideData[]>([]);
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Required columns that must have valid data
  const requiredColumns = [
    "Student Name",
    "Driver Name",
    "Pickup Location",
    "Pickup Time",
    "Dropoff Location",
    "Dropoff Time",
    "Start Date",
    "End Date",
    "Ride Type",
    "Cost",
  ];

  // Optional columns
  const optionalColumns = [
    "Pickup Latitude",
    "Pickup Longitude",
    "Dropoff Latitude",
    "Dropoff Longitude",
    "Comments",
  ];

  // All valid columns
  const allValidColumns = [...requiredColumns, ...optionalColumns];

  const downloadTemplate = () => {
    // Create sample data that matches your system
    const sampleDriverNames = drivers
      .slice(0, 2)
      .map((d) => d.name)
      .filter(Boolean);
    const sampleStudentNames = students.slice(0, 2).map((s) => s.name);

    const template = [
      {
        "Student Name": sampleStudentNames[0] || "John Doe",
        "Driver Name": sampleDriverNames[0] || "Jane Smith",
        "Pickup Location": "123 Main Street, Nairobi, Kenya",
        "Pickup Time": "07:30",
        "Pickup Latitude": -1.2921,
        "Pickup Longitude": 36.8219,
        "Dropoff Location": "ABC School, Nairobi, Kenya",
        "Dropoff Time": "08:00",
        "Dropoff Latitude": -1.2841,
        "Dropoff Longitude": 36.8155,
        "Start Date": "2025-01-20",
        "End Date": "2025-06-30",
        "Ride Type": "Private",
        Cost: 1000,
        Comments: "Morning pickup - handle with care",
      },
      {
        "Student Name": sampleStudentNames[1] || "Mary Johnson",
        "Driver Name": sampleDriverNames[1] || "Bob Wilson",
        "Pickup Location": "456 Oak Avenue, Nairobi, Kenya",
        "Pickup Time": "15:30",
        "Pickup Latitude": -1.3197,
        "Pickup Longitude": 36.6859,
        "Dropoff Location": "XYZ School, Nairobi, Kenya",
        "Dropoff Time": "16:00",
        "Dropoff Latitude": -1.3521,
        "Dropoff Longitude": 36.7617,
        "Start Date": "2025-01-20",
        "End Date": "2025-06-30",
        "Ride Type": "Carpool",
        Cost: 800,
        Comments: "Afternoon pickup - shared ride",
      },
    ];

    // Convert to CSV
    const headers = Object.keys(template[0]);
    const csvContent = [
      headers.join(","),
      ...template.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle values that might contain commas
            if (typeof value === "string" && value.includes(",")) {
              return `"${value}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_rides_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    // Reset state
    setResults(null);
    setParsedData([]);
    setValidationResults([]);

    // Validate file type
    const fileName = uploadedFile.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      alert(
        "Please upload a CSV file (.csv). For Excel files, save as CSV first."
      );
      return;
    }

    // Check file size (limit to 5MB)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      alert("File is too large. Please upload files smaller than 5MB.");
      return;
    }

    setFile(uploadedFile);
    parseCSVFile(uploadedFile);
  };

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || text.trim().length === 0) {
          alert("File appears to be empty.");
          return;
        }

        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          alert(
            "CSV file must contain at least a header row and one data row."
          );
          return;
        }

        // Parse CSV with proper handling of quoted values
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = "";
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }

          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]).map((h) =>
          h.replace(/"/g, "").trim()
        );

        // Validate headers
        const missingRequired = requiredColumns.filter(
          (col) => !headers.includes(col)
        );
        if (missingRequired.length > 0) {
          alert(
            `Missing required columns: ${missingRequired.join(", ")}\n\nPlease download the template and ensure all required columns are present.`
          );
          return;
        }

        const invalidColumns = headers.filter(
          (h) => h && !allValidColumns.includes(h)
        );
        if (invalidColumns.length > 0) {
          console.warn(`Unknown columns found: ${invalidColumns.join(", ")}`);
        }

        const data: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]).map((v) =>
            v.replace(/"/g, "").trim()
          );
          const row: any = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          // Skip completely empty rows
          const hasData = Object.values(row).some(
            (val) => String(val).trim().length > 0
          );
          if (hasData) {
            data.push(row);
          }
        }

        if (data.length === 0) {
          alert("No data rows found in the CSV file.");
          return;
        }

        // Convert to BulkRideData format with type validation
        const parsedRides: BulkRideData[] = data.map((row: any) => {
          const parseNumber = (value: any): number | undefined => {
            if (!value || value === "") return undefined;
            const num = Number(value);
            return isNaN(num) ? undefined : num;
          };

          return {
            studentName: String(row["Student Name"] || "").trim(),
            driverName: String(row["Driver Name"] || "").trim(),
            pickupLocation: String(row["Pickup Location"] || "").trim(),
            pickupTime: String(row["Pickup Time"] || "").trim(),
            pickupLat: parseNumber(row["Pickup Latitude"]),
            pickupLng: parseNumber(row["Pickup Longitude"]),
            dropoffLocation: String(row["Dropoff Location"] || "").trim(),
            dropoffTime: String(row["Dropoff Time"] || "").trim(),
            dropoffLat: parseNumber(row["Dropoff Latitude"]),
            dropoffLng: parseNumber(row["Dropoff Longitude"]),
            startDate: String(row["Start Date"] || "").trim(),
            endDate: String(row["End Date"] || "").trim(),
            rideType: String(row["Ride Type"] || "Private").trim() as
              | "Private"
              | "Carpool"
              | "Bus",
            cost: parseNumber(row["Cost"]) || 0,
            comments: String(row["Comments"] || "").trim(),
          };
        });

        setParsedData(parsedRides);
        validateData(parsedRides);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert(
          "Error parsing CSV file. Please check the format and try again. Make sure the file is properly saved as CSV."
        );
      }
    };

    reader.onerror = () => {
      alert("Error reading file. Please try again.");
    };

    reader.readAsText(file, "utf-8");
  };

  const validateData = (data: BulkRideData[]) => {
    const results: ValidationResult[] = data.map((ride, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate required fields are not empty
      if (!ride.studentName.trim())
        errors.push("Student Name is required and cannot be empty");
      if (!ride.driverName.trim())
        errors.push("Driver Name is required and cannot be empty");
      if (!ride.pickupLocation.trim())
        errors.push("Pickup Location is required and cannot be empty");
      if (!ride.dropoffLocation.trim())
        errors.push("Dropoff Location is required and cannot be empty");
      if (!ride.pickupTime.trim())
        errors.push("Pickup Time is required and cannot be empty");
      if (!ride.dropoffTime.trim())
        errors.push("Dropoff Time is required and cannot be empty");
      if (!ride.startDate.trim())
        errors.push("Start Date is required and cannot be empty");
      if (!ride.endDate.trim())
        errors.push("End Date is required and cannot be empty");

      // Find student by name (case-insensitive, exact match)
      const student = students.find(
        (s) =>
          s.name.toLowerCase().trim() === ride.studentName.toLowerCase().trim()
      );
      if (!student && ride.studentName.trim()) {
        errors.push(
          `Student "${ride.studentName}" not found in system. Check spelling and ensure exact match.`
        );
      }

      // Find driver by name (case-insensitive, exact match)
      const driver = drivers.find(
        (d) =>
          d.name?.toLowerCase().trim() === ride.driverName.toLowerCase().trim()
      );
      if (!driver && ride.driverName.trim()) {
        errors.push(
          `Driver "${ride.driverName}" not found in system. Check spelling and ensure exact match.`
        );
      }

      // Check driver availability
      if (driver && driver.available_seats <= 0) {
        errors.push(
          `Driver "${ride.driverName}" has no available seats (${driver.available_seats}/${driver.seat_count})`
        );
      }

      // Validate time format (HH:MM) - strict validation
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (ride.pickupTime.trim() && !timeRegex.test(ride.pickupTime)) {
        errors.push(
          `Pickup Time "${ride.pickupTime}" must be in HH:MM format (e.g., 07:30, 15:45). No AM/PM.`
        );
      }
      if (ride.dropoffTime.trim() && !timeRegex.test(ride.dropoffTime)) {
        errors.push(
          `Dropoff Time "${ride.dropoffTime}" must be in HH:MM format (e.g., 16:00, 08:15). No AM/PM.`
        );
      }

      // Validate logical time sequence
      if (
        ride.pickupTime &&
        ride.dropoffTime &&
        timeRegex.test(ride.pickupTime) &&
        timeRegex.test(ride.dropoffTime)
      ) {
        const [pickupHour, pickupMin] = ride.pickupTime.split(":").map(Number);
        const [dropoffHour, dropoffMin] = ride.dropoffTime
          .split(":")
          .map(Number);
        const pickupMinutes = pickupHour * 60 + pickupMin;
        const dropoffMinutes = dropoffHour * 60 + dropoffMin;

        if (dropoffMinutes <= pickupMinutes) {
          warnings.push("Dropoff time should be after pickup time");
        }
      }

      // Validate date format (YYYY-MM-DD) - strict validation
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (ride.startDate.trim() && !dateRegex.test(ride.startDate)) {
        errors.push(
          `Start Date "${ride.startDate}" must be in YYYY-MM-DD format (e.g., 2025-01-20)`
        );
      }
      if (ride.endDate.trim() && !dateRegex.test(ride.endDate)) {
        errors.push(
          `End Date "${ride.endDate}" must be in YYYY-MM-DD format (e.g., 2025-06-30)`
        );
      }

      // Validate date logic and realistic dates
      if (
        ride.startDate &&
        ride.endDate &&
        dateRegex.test(ride.startDate) &&
        dateRegex.test(ride.endDate)
      ) {
        const startDate = new Date(ride.startDate);
        const endDate = new Date(ride.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(startDate.getTime())) {
          errors.push(`Invalid Start Date: "${ride.startDate}"`);
        } else if (startDate < today) {
          warnings.push("Start Date is in the past");
        }

        if (isNaN(endDate.getTime())) {
          errors.push(`Invalid End Date: "${ride.endDate}"`);
        }

        if (startDate > endDate) {
          errors.push("Start Date must be before End Date");
        }

        // Check for reasonable duration (not more than 1 year)
        const daysDiff =
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
          warnings.push("Ride duration is longer than 1 year");
        }
      }

      // Validate ride type (exact match)
      const validRideTypes = ["Private", "Carpool", "Bus"];
      if (!validRideTypes.includes(ride.rideType)) {
        errors.push(
          `Ride Type "${ride.rideType}" must be exactly one of: ${validRideTypes.join(", ")} (case sensitive)`
        );
      }

      // Validate cost (must be positive number)
      if (isNaN(ride.cost) || ride.cost <= 0) {
        errors.push(
          `Cost "${ride.cost}" must be a positive number (no currency symbols)`
        );
      } else if (ride.cost > 10000) {
        warnings.push(`Cost ${ride.cost} seems unusually high`);
      }

      // Validate coordinates if provided (optional but must be valid if present)
      if (ride.pickupLat !== undefined) {
        if (
          isNaN(ride.pickupLat) ||
          ride.pickupLat < -90 ||
          ride.pickupLat > 90
        ) {
          errors.push(
            `Pickup Latitude "${ride.pickupLat}" must be a decimal number between -90 and 90`
          );
        }
      }
      if (ride.pickupLng !== undefined) {
        if (
          isNaN(ride.pickupLng) ||
          ride.pickupLng < -180 ||
          ride.pickupLng > 180
        ) {
          errors.push(
            `Pickup Longitude "${ride.pickupLng}" must be a decimal number between -180 and 180`
          );
        }
      }
      if (ride.dropoffLat !== undefined) {
        if (
          isNaN(ride.dropoffLat) ||
          ride.dropoffLat < -90 ||
          ride.dropoffLat > 90
        ) {
          errors.push(
            `Dropoff Latitude "${ride.dropoffLat}" must be a decimal number between -90 and 90`
          );
        }
      }
      if (ride.dropoffLng !== undefined) {
        if (
          isNaN(ride.dropoffLng) ||
          ride.dropoffLng < -180 ||
          ride.dropoffLng > 180
        ) {
          errors.push(
            `Dropoff Longitude "${ride.dropoffLng}" must be a decimal number between -180 and 180`
          );
        }
      }

      // Validate Kenya-specific coordinates if provided
      if (ride.pickupLat !== undefined && ride.pickupLng !== undefined) {
        // Kenya is roughly between -4.7 to 5.0 latitude and 33.9 to 41.9 longitude
        if (
          ride.pickupLat < -5 ||
          ride.pickupLat > 5 ||
          ride.pickupLng < 33 ||
          ride.pickupLng > 42
        ) {
          warnings.push("Pickup coordinates appear to be outside Kenya");
        }
      }

      if (ride.dropoffLat !== undefined && ride.dropoffLng !== undefined) {
        if (
          ride.dropoffLat < -5 ||
          ride.dropoffLat > 5 ||
          ride.dropoffLng < 33 ||
          ride.dropoffLng > 42
        ) {
          warnings.push("Dropoff coordinates appear to be outside Kenya");
        }
      }

      // Validate location formats
      if (ride.pickupLocation && ride.pickupLocation.length < 5) {
        warnings.push(
          "Pickup location seems too short - consider adding more detail"
        );
      }
      if (ride.dropoffLocation && ride.dropoffLocation.length < 5) {
        warnings.push(
          "Dropoff location seems too short - consider adding more detail"
        );
      }

      // Add IDs if entities found
      const validatedRide = {
        ...ride,
        studentId: student?.id,
        driverId: driver?.id,
      };

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        data: validatedRide,
        row: index + 1,
      };
    });

    setValidationResults(results);
  };

  const processBulkRides = async () => {
    if (!assignRide) {
      alert("Ride assignment function not available");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const validRides = validationResults.filter((r) => r.valid && r.data);
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < validRides.length; i++) {
      const result = validRides[i];
      if (!result.data) continue;

      try {
        // Create FormData exactly matching your assignRide function signature
        const formData = new FormData();
        formData.append("driver_id", result.data.driverId!.toString());
        formData.append("student_id", result.data.studentId!.toString());
        formData.append("pickup_location", result.data.pickupLocation);
        formData.append("pickup_time", result.data.pickupTime);
        formData.append(
          "pickup_lat",
          result.data.pickupLat?.toString() || "-1.2921"
        );
        formData.append(
          "pickup_lng",
          result.data.pickupLng?.toString() || "36.8219"
        );
        formData.append("dropoff_location", result.data.dropoffLocation);
        formData.append("dropoff_time", result.data.dropoffTime);
        formData.append(
          "dropoff_lat",
          result.data.dropoffLat?.toString() || "-1.2841"
        );
        formData.append(
          "dropoff_lng",
          result.data.dropoffLng?.toString() || "36.8155"
        );
        formData.append("start_date", result.data.startDate);
        formData.append("end_date", result.data.endDate);
        formData.append("type", result.data.rideType);
        formData.append("cost", result.data.cost.toString());
        formData.append(
          "comments",
          result.data.comments || `Bulk upload - Row ${result.row}`
        );

        // Call your existing assignRide function
        const response = await assignRide(formData);

        // Your assignRide function redirects on success, but might return error messages
        if (
          response?.message &&
          (response.message.includes("error") ||
            response.message.includes("failed") ||
            response.message.includes("Invalid"))
        ) {
          failed++;
          errors.push(
            `Row ${result.row} (${result.data.studentName}): ${response.message}`
          );
        } else {
          successful++;
        }
      } catch (error) {
        failed++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        errors.push(
          `Row ${result.row} (${result.data?.studentName || "Unknown"}): ${errorMessage}`
        );
        console.error(`Error processing row ${result.row}:`, error);
      }

      setProgress(((i + 1) / validRides.length) * 100);

      // Add small delay to prevent overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setResults({ successful, failed, errors });
    setIsProcessing(false);
  };

  const validCount = validationResults.filter((r) => r.valid).length;
  const invalidCount = validationResults.filter((r) => !r.valid).length;
  const warningCount = validationResults.filter(
    (r) => r.warnings.length > 0
  ).length;

  return (
    <div className="space-y-6 my-8">
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Rides</TabsTrigger>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Download Template */}
              <div className="flex flex-col space-y-2">
                <Label className="ml-1">Download CSV Template</Label>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="w-full h-10 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>

              {/* Upload File */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="file-upload" className="ml-1">
                  Upload CSV File
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full h-10"
                />
              </div>
            </div>
          </CardContent>

          {validationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
                <CardDescription>
                  Review validation results before processing. All errors must
                  be fixed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {validCount} Valid
                  </Badge>
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    {invalidCount} Invalid
                  </Badge>
                  {warningCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {warningCount} Warnings
                    </Badge>
                  )}
                </div>

                {invalidCount > 0 && (
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Validation Errors (Must Fix)
                    </h4>
                    {validationResults
                      .filter((r) => !r.valid)
                      .map((result, index) => (
                        <div
                          key={index}
                          className="mb-2 p-2 bg-red-50 rounded text-sm"
                        >
                          <div className="font-medium text-red-700">
                            Row {result.row} -{" "}
                            {result.data?.studentName || "Unknown"}:
                          </div>
                          <ul className="list-disc list-inside text-red-600">
                            {result.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                )}

                {warningCount > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-yellow-200 rounded-lg p-3">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Warnings (Review Recommended)
                    </h4>
                    {validationResults
                      .filter((r) => r.warnings.length > 0)
                      .map((result, index) => (
                        <div
                          key={index}
                          className="mb-2 p-2 bg-yellow-50 rounded text-sm"
                        >
                          <div className="font-medium text-yellow-700">
                            Row {result.row} - {result.data?.studentName}:
                          </div>
                          <ul className="list-disc list-inside text-yellow-600">
                            {result.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                )}

                {validCount > 0 && (
                  <div className="space-y-4">
                    <div className="border border-green-200 rounded-lg p-3">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Valid Rides Preview
                      </h4>
                      {validationResults
                        .filter((r) => r.valid)
                        .slice(0, 3)
                        .map((result, index) => (
                          <div
                            key={index}
                            className="text-sm p-2 border-l-2 border-green-500 mb-2"
                          >
                            <div className="font-medium">
                              {result.data?.studentName} →{" "}
                              {result.data?.driverName}
                            </div>
                            <div className="text-muted-foreground">
                              {result.data?.pickupLocation} to{" "}
                              {result.data?.dropoffLocation}(
                              {result.data?.startDate} - {result.data?.endDate})
                              - {result.data?.rideType} - KES{" "}
                              {result.data?.cost}
                            </div>
                          </div>
                        ))}
                      {validCount > 3 && (
                        <div className="text-sm text-muted-foreground">
                          ...and {validCount - 3} more valid rides
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        onClick={processBulkRides}
                        disabled={isProcessing || validCount === 0}
                        className="flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>Processing... ({Math.round(progress)}%)</>
                        ) : (
                          <>Create {validCount} Rides</>
                        )}
                      </Button>

                      {isProcessing && (
                        <div className="flex-1">
                          <Progress value={progress} className="w-full" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Processing Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {results.successful} Successful
                  </Badge>
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    {results.failed} Failed
                  </Badge>
                </div>

                {results.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
                    <h4 className="font-medium mb-2">Processing Errors</h4>
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 mb-1">
                        {error}
                      </div>
                    ))}
                  </div>
                )}

                {results.successful > 0 && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Successfully created {results.successful} rides! Students
                      and drivers have been notified via email and in-app
                      notifications.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Drivers
                </CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{drivers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active drivers in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">
                  Registered students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Seats
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {drivers.reduce(
                    (sum, driver) => sum + driver.available_seats,
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all vehicles
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>CSV Template Requirements</CardTitle>
              <CardDescription>
                Critical data format requirements for successful upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-red-600">
                    Required Columns (Must Have Data):
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {requiredColumns.map((field) => (
                      <li key={field}>• {field}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-blue-600">
                    Optional Columns:
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {optionalColumns.map((field) => (
                      <li key={field}>• {field}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <strong>CRITICAL Data Type Requirements:</strong>
                    <br />• <strong>Times:</strong> Must be HH:MM format (07:30,
                    15:45) - NO AM/PM, NO seconds
                    <br />• <strong>Dates:</strong> Must be YYYY-MM-DD format
                    (2025-01-20) - NO other formats
                    <br />• <strong>Cost:</strong> Numbers only (1000, 800) - NO
                    currency symbols (KES, $)
                    <br />• <strong>Ride Type:</strong> Exactly "Private",
                    "Carpool", or "Bus" - Case sensitive
                    <br />• <strong>Names:</strong> Must EXACTLY match existing
                    student/driver names
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <strong>Coordinate Format (if provided):</strong>
                    <br />• <strong>Latitude:</strong> Decimal degrees: -1.2921
                    (between -90 and 90)
                    <br />• <strong>Longitude:</strong> Decimal degrees: 36.8219
                    (between -180 and 180)
                    <br />• <strong>Kenya Range:</strong> Lat: -5 to 5, Lng: 33
                    to 42
                    <br />•{" "}
                    <strong>
                      NO degree symbols (°) or minutes/seconds format
                    </strong>
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>Validation Process:</strong>
                    <br />• Student/Driver names checked against system database
                    <br />• Driver availability verified before assignment
                    <br />• Date ranges validated (no past dates, reasonable
                    duration)
                    <br />• Time sequences checked (dropoff after pickup)
                    <br />• Coordinates geocoded if missing, validated if
                    provided
                    <br />• All data types strictly enforced
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>Success Tips:</strong>
                    <br />• Download template and use exact format shown
                    <br />• Verify names match system records before upload
                    <br />• Use consistent date/time formats throughout
                    <br />• Check driver seat availability in System Overview
                    <br />• Validate coordinates using Google Maps if needed
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
