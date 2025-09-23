"use client";

export interface ValidationError {
  field: string;
  message: string;
  value: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class RideDataValidator {
  /**
   * Validates time format (HH:MM)
   */
  static validateTimeFormat(
    time: string,
    fieldName: string
  ): ValidationError | null {
    if (!time || !time.trim()) {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        value: time,
      };
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time.trim())) {
      return {
        field: fieldName,
        message: `${fieldName} must be in HH:MM format (e.g., 07:30, 15:45). No AM/PM allowed.`,
        value: time,
      };
    }

    return null;
  }

  /**
   * Validates date format (YYYY-MM-DD)
   */
  static validateDateFormat(
    date: string,
    fieldName: string
  ): ValidationError | null {
    if (!date || !date.trim()) {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        value: date,
      };
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      return {
        field: fieldName,
        message: `${fieldName} must be in YYYY-MM-DD format (e.g., 2025-01-20)`,
        value: date,
      };
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return {
        field: fieldName,
        message: `${fieldName} is not a valid date`,
        value: date,
      };
    }

    return null;
  }

  /**
   * Validates date range logic
   */
  static validateDateRange(
    startDate: string,
    endDate: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start > end) {
      errors.push({
        field: "dateRange",
        message: "Start date must be before end date",
        value: { startDate, endDate },
      });
    }

    if (start < today) {
      errors.push({
        field: "startDate",
        message: "Start date cannot be in the past",
        value: startDate,
      });
    }

    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      errors.push({
        field: "dateRange",
        message: "Ride duration cannot exceed 1 year",
        value: { startDate, endDate, daysDiff },
      });
    }

    return errors;
  }

  /**
   * Validates coordinates (latitude/longitude)
   */
  static validateCoordinates(
    lat: number | undefined,
    lng: number | undefined,
    locationName: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (lat !== undefined) {
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push({
          field: `${locationName}Latitude`,
          message: `${locationName} latitude must be between -90 and 90`,
          value: lat,
        });
      }
    }

    if (lng !== undefined) {
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push({
          field: `${locationName}Longitude`,
          message: `${locationName} longitude must be between -180 and 180`,
          value: lng,
        });
      }
    }

    return errors;
  }

  /**
   * Validates Kenya-specific coordinates
   */
  static validateKenyaCoordinates(
    lat: number | undefined,
    lng: number | undefined,
    locationName: string
  ): ValidationError[] {
    const warnings: ValidationError[] = [];

    if (lat !== undefined && lng !== undefined) {
      // Kenya rough bounds: lat -5 to 5, lng 33 to 42
      if (lat < -5 || lat > 5 || lng < 33 || lng > 42) {
        warnings.push({
          field: `${locationName}Coordinates`,
          message: `${locationName} coordinates appear to be outside Kenya`,
          value: { lat, lng },
        });
      }
    }

    return warnings;
  }

  /**
   * Validates cost format
   */
  static validateCost(
    cost: number,
    fieldName: string = "Cost"
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (isNaN(cost) || cost <= 0) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be a positive number (no currency symbols)`,
        value: cost,
      });
    } else if (cost > 10000) {
      warnings.push({
        field: fieldName,
        message: `${fieldName} of ${cost} seems unusually high`,
        value: cost,
      });
    }

    return [...errors, ...warnings];
  }

  /**
   * Validates ride type
   */
  static validateRideType(rideType: string): ValidationError | null {
    const validTypes = ["Private", "Carpool", "Bus"];

    if (!validTypes.includes(rideType)) {
      return {
        field: "rideType",
        message: `Ride Type must be exactly one of: ${validTypes.join(", ")} (case sensitive)`,
        value: rideType,
      };
    }

    return null;
  }

  /**
   * Validates time sequence (pickup before dropoff)
   */
  static validateTimeSequence(
    pickupTime: string,
    dropoffTime: string
  ): ValidationError[] {
    const warnings: ValidationError[] = [];

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(pickupTime) && timeRegex.test(dropoffTime)) {
      const [pickupHour, pickupMin] = pickupTime.split(":").map(Number);
      const [dropoffHour, dropoffMin] = dropoffTime.split(":").map(Number);
      const pickupMinutes = pickupHour * 60 + pickupMin;
      const dropoffMinutes = dropoffHour * 60 + dropoffMin;

      if (dropoffMinutes <= pickupMinutes) {
        warnings.push({
          field: "timeSequence",
          message: "Dropoff time should be after pickup time",
          value: { pickupTime, dropoffTime },
        });
      }

      // Check for reasonable duration (not too short or too long)
      const durationMinutes = dropoffMinutes - pickupMinutes;
      if (durationMinutes < 10) {
        warnings.push({
          field: "timeSequence",
          message: "Ride duration seems very short (less than 10 minutes)",
          value: { pickupTime, dropoffTime, duration: durationMinutes },
        });
      } else if (durationMinutes > 180) {
        warnings.push({
          field: "timeSequence",
          message: "Ride duration seems very long (more than 3 hours)",
          value: { pickupTime, dropoffTime, duration: durationMinutes },
        });
      }
    }

    return warnings;
  }

  /**
   * Validates location string format
   */
  static validateLocation(
    location: string,
    fieldName: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!location || !location.trim()) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        value: location,
      });
    } else if (location.trim().length < 5) {
      warnings.push({
        field: fieldName,
        message: `${fieldName} seems too short - consider adding more detail`,
        value: location,
      });
    }

    return [...errors, ...warnings];
  }

  /**
   * Validates required string fields
   */
  static validateRequiredString(
    value: string,
    fieldName: string
  ): ValidationError | null {
    if (!value || !value.trim()) {
      return {
        field: fieldName,
        message: `${fieldName} is required and cannot be empty`,
        value: value,
      };
    }
    return null;
  }

  /**
   * Comprehensive validation for bulk ride data
   */
  static validateBulkRideRow(
    data: any,
    drivers: any[],
    students: any[],
    rowNumber: number
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Required string validations
    const requiredStringError1 = this.validateRequiredString(
      data.studentName,
      "Student Name"
    );
    if (requiredStringError1) errors.push(requiredStringError1);

    const requiredStringError2 = this.validateRequiredString(
      data.driverName,
      "Driver Name"
    );
    if (requiredStringError2) errors.push(requiredStringError2);

    // Location validations
    const pickupLocationResults = this.validateLocation(
      data.pickupLocation,
      "Pickup Location"
    );
    errors.push(
      ...pickupLocationResults.filter((e) => e.field.includes("required"))
    );
    warnings.push(
      ...pickupLocationResults.filter((e) => !e.field.includes("required"))
    );

    const dropoffLocationResults = this.validateLocation(
      data.dropoffLocation,
      "Dropoff Location"
    );
    errors.push(
      ...dropoffLocationResults.filter((e) => e.field.includes("required"))
    );
    warnings.push(
      ...dropoffLocationResults.filter((e) => !e.field.includes("required"))
    );

    // Time validations
    const pickupTimeError = this.validateTimeFormat(
      data.pickupTime,
      "Pickup Time"
    );
    if (pickupTimeError) errors.push(pickupTimeError);

    const dropoffTimeError = this.validateTimeFormat(
      data.dropoffTime,
      "Dropoff Time"
    );
    if (dropoffTimeError) errors.push(dropoffTimeError);

    // Time sequence validation (only if both times are valid)
    if (!pickupTimeError && !dropoffTimeError) {
      const timeSequenceWarnings = this.validateTimeSequence(
        data.pickupTime,
        data.dropoffTime
      );
      warnings.push(...timeSequenceWarnings);
    }

    // Date validations
    const startDateError = this.validateDateFormat(
      data.startDate,
      "Start Date"
    );
    if (startDateError) errors.push(startDateError);

    const endDateError = this.validateDateFormat(data.endDate, "End Date");
    if (endDateError) errors.push(endDateError);

    // Date range validation (only if both dates are valid)
    if (!startDateError && !endDateError) {
      const dateRangeErrors = this.validateDateRange(
        data.startDate,
        data.endDate
      );
      errors.push(
        ...dateRangeErrors.filter(
          (e) => e.message.includes("must") || e.message.includes("cannot")
        )
      );
      warnings.push(
        ...dateRangeErrors.filter(
          (e) => !e.message.includes("must") && !e.message.includes("cannot")
        )
      );
    }

    // Cost validation
    const costResults = this.validateCost(data.cost);
    errors.push(...costResults.filter((e) => e.message.includes("must")));
    warnings.push(...costResults.filter((e) => !e.message.includes("must")));

    // Ride type validation
    const rideTypeError = this.validateRideType(data.rideType);
    if (rideTypeError) errors.push(rideTypeError);

    // Coordinate validations
    const pickupCoordErrors = this.validateCoordinates(
      data.pickupLat,
      data.pickupLng,
      "Pickup"
    );
    errors.push(...pickupCoordErrors);

    const dropoffCoordErrors = this.validateCoordinates(
      data.dropoffLat,
      data.dropoffLng,
      "Dropoff"
    );
    errors.push(...dropoffCoordErrors);

    // Kenya-specific coordinate warnings
    const pickupKenyaWarnings = this.validateKenyaCoordinates(
      data.pickupLat,
      data.pickupLng,
      "Pickup"
    );
    warnings.push(...pickupKenyaWarnings);

    const dropoffKenyaWarnings = this.validateKenyaCoordinates(
      data.dropoffLat,
      data.dropoffLng,
      "Dropoff"
    );
    warnings.push(...dropoffKenyaWarnings);

    // Entity existence validations
    if (data.studentName?.trim()) {
      const student = students.find(
        (s) =>
          s.name.toLowerCase().trim() === data.studentName.toLowerCase().trim()
      );
      if (!student) {
        errors.push({
          field: "studentName",
          message: `Student "${data.studentName}" not found in system. Check spelling and ensure exact match.`,
          value: data.studentName,
        });
      }
    }

    if (data.driverName?.trim()) {
      const driver = drivers.find(
        (d) =>
          d.name?.toLowerCase().trim() === data.driverName.toLowerCase().trim()
      );
      if (!driver) {
        errors.push({
          field: "driverName",
          message: `Driver "${data.driverName}" not found in system. Check spelling and ensure exact match.`,
          value: data.driverName,
        });
      } else if (driver.available_seats <= 0) {
        errors.push({
          field: "driverName",
          message: `Driver "${data.driverName}" has no available seats (${driver.available_seats}/${driver.seat_count})`,
          value: data.driverName,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Utility functions for data formatting and parsing
 */
export class DataFormatter {
  /**
   * Safely parse number from string/any type
   */
  static parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === "") return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  /**
   * Safely parse and trim string
   */
  static parseString(value: any): string {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  /**
   * Format time to HH:MM
   */
  static formatTime(time: string): string {
    const trimmed = time.trim();
    if (trimmed.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = trimmed.split(":");
      return `${hours.padStart(2, "0")}:${minutes}`;
    }
    return trimmed;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  static formatDate(date: string): string {
    const trimmed = date.trim();
    // Handle various date formats and convert to YYYY-MM-DD
    try {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
      }
    } catch (error) {
      // Return original if can't parse
    }
    return trimmed;
  }

  /**
   * Parse CSV line with proper quote handling
   */
  static parseCSVLine(line: string): string[] {
    const result: string[] = []; // <-- give it a type
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }
}
