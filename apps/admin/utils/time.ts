/**
 * Converts a UTC timestamp to Nairobi local time
 * @param utcDate - UTC date/timestamp from database
 * @param format - Output format type
 * @returns Formatted date string in Nairobi timezone
 */
export const convertUTCToNairobi = (
  utcDate: Date | string | number,
  format: "datetime" | "date" | "time" | "full" | "custom" = "datetime"
): string => {
  const date = new Date(utcDate);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }

  const timeZone = "Africa/Nairobi";

  switch (format) {
    case "datetime":
      return date.toLocaleString("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

    case "date":
      return date.toLocaleDateString("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

    case "time":
      return date.toLocaleTimeString("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

    case "full":
      return date.toLocaleString("en-US", {
        timeZone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

    default:
      return date.toLocaleString("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
  }
};

/**
 * Converts a UTC timestamp to Nairobi time with custom formatting options
 * @param utcDate - UTC date/timestamp from database
 * @param options - Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string in Nairobi timezone
 */
export const convertUTCToNairobiCustom = (
  utcDate: Date | string | number,
  options: Intl.DateTimeFormatOptions
): string => {
  const date = new Date(utcDate);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }

  return date.toLocaleString("en-US", {
    ...options,
    timeZone: "Africa/Nairobi",
  });
};

/**
 * Returns a Date object representing the current time in Nairobi
 * Note: This returns a Date object, but it's adjusted to show Nairobi time
 * @returns Date object adjusted for Nairobi timezone
 */
export const getNairobiTime = (): Date => {
  const now = new Date();
  const nairobiTimeString = now.toLocaleString("en-US", {
    timeZone: "Africa/Nairobi",
  });
  return new Date(nairobiTimeString);
};

/**
 * Converts multiple UTC timestamps to Nairobi time
 * Useful for batch processing of data from database
 * @param utcDates - Array of UTC dates/timestamps
 * @param format - Output format type
 * @returns Array of formatted date strings in Nairobi timezone
 */
export const convertMultipleUTCToNairobi = (
  utcDates: (Date | string | number)[],
  format: "datetime" | "date" | "time" | "full" = "datetime"
): string[] => {
  return utcDates.map((date) => {
    try {
      return convertUTCToNairobi(date, format);
    } catch (error) {
      return "Invalid Date";
    }
  });
};

/**
 * Formats ride data with converted timestamps
 * Example utility function for your specific use case
 */
export const formatRideWithNairobiTime = (ride: any) => {
  return {
    ...ride,
    embark_time_display: ride.embark_time
      ? convertUTCToNairobi(ride.embark_time, "datetime")
      : null,
    disembark_time_display: ride.disembark_time
      ? convertUTCToNairobi(ride.disembark_time, "datetime")
      : null,
    start_time_display: ride.start_time
      ? convertUTCToNairobi(ride.start_time, "datetime")
      : null,
    end_time_display: ride.end_time
      ? convertUTCToNairobi(ride.end_time, "datetime")
      : null,
  };
};

/**
 * Helper to check if a date is today in Nairobi timezone
 * @param utcDate - UTC date to check
 * @returns boolean indicating if date is today in Nairobi
 */
export const isToday = (utcDate: Date | string | number): boolean => {
  const date = new Date(utcDate);
  const today = new Date();

  const dateInNairobi = date.toLocaleDateString("en-CA", {
    timeZone: "Africa/Nairobi",
  });
  const todayInNairobi = today.toLocaleDateString("en-CA", {
    timeZone: "Africa/Nairobi",
  });

  return dateInNairobi === todayInNairobi;
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 30 minutes")
 * @param utcDate - UTC date to compare
 * @returns Relative time string in Nairobi context
 */
export const getRelativeTime = (utcDate: Date | string | number): string => {
  const date = new Date(utcDate);
  const now = getNairobiTime();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return convertUTCToNairobi(date, "date");
};
