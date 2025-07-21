// src/lib/utils/formatters.ts

// Date formatting utilities
export const formatDate = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format Firebase timestamp to normal date
export const formatFirebaseTImestampDate = (timestamp: { seconds: number, nanoseconds: number }): string => {
  const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  const dateObj = new Date(milliseconds);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateShort = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(diffInDays / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

// String formatting utilities
export const capitalizeFirst = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => capitalizeFirst(word))
    .join(" ");
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

// Name formatting
export const formatFullName = (
  firstName?: string,
  lastName?: string
): string => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(" ");
};

export const getInitials = (name: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

// Number formatting utilities
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${Math.round(percentage)}%`;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Format international numbers with country code
  if (digits.length > 10) {
    const countryCode = digits.slice(0, digits.length - 10);
    const number = digits.slice(-10);
    return `+${countryCode} (${number.slice(0, 3)}) ${number.slice(
      3,
      6
    )}-${number.slice(6)}`;
  }

  return phone; // Return original if format not recognized
};

// Array formatting utilities
export const formatList = (
  items: string[],
  conjunction: string = "and"
): string => {
  if (!items || items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(", ")}, ${conjunction} ${lastItem}`;
};

export const formatSkills = (skills: string[]): string => {
  return formatList(skills, "and");
};

// Duration formatting
export const formatDuration = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const diffInMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (diffInMonths < 1) {
    return "Less than a month";
  }

  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""}`;
  }

  const years = Math.floor(diffInMonths / 12);
  const remainingMonths = diffInMonths % 12;

  let result = `${years} year${years > 1 ? "s" : ""}`;
  if (remainingMonths > 0) {
    result += ` ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
  }

  return result;
};

// Experience formatting
export const formatExperience = (years: number): string => {
  if (years === 0) return "No experience";
  if (years < 1) return "Less than 1 year";
  if (years === 1) return "1 year";
  return `${years} years`;
};

// URL formatting
export const ensureHttps = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

// Search query formatting
export const formatSearchQuery = (query: string): string => {
  return query.trim().toLowerCase().replace(/\s+/g, " "); // Replace multiple spaces with single space
};

// Portfolio data formatting for display
export const formatPortfolioForDisplay = (portfolio: any) => {
  return {
    ...portfolio,
    formattedExperience: formatExperience(portfolio.yearsOfExperience),
    formattedPhone: formatPhoneNumber(portfolio.mobileNo),
    formattedCreatedAt: formatDate(portfolio.createdAt),
    formattedUpdatedAt: formatRelativeTime(portfolio.updatedAt),
    skillsList:
      portfolio.technicalSkills
        ?.map(
          (category: any) =>
            `${category.category}: ${formatSkills(category.skills)}`
        )
        .join("; ") || "",
    projectTechnologies:
      portfolio.projects?.map((project: any) =>
        formatSkills(project.technologies)
      ) || [],
  };
};

// Error message formatting
export const formatErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.code)
    return error.code
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  return "An unexpected error occurred";
};

// Form field name formatting
export const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize each word
};
