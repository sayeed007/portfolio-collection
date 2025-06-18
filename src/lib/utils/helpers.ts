// src/lib/utils/helpers.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FILE_LIMITS, VALIDATION_MESSAGES } from "./constants";

// Utility function to merge class names
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Utility function to generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Utility function to generate UUID v4
export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array)
    return obj.map((item) => deepClone(item)) as unknown as T;
  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

// Check if object is empty
export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  return Object.keys(obj).length === 0;
};

// Remove empty fields from object
export const removeEmptyFields = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        const filteredArray = value.filter(
          (item) => item !== null && item !== undefined && item !== ""
        );
        if (filteredArray.length > 0) {
          result[key] = value;
        }
      }
    }

    return result;
  }
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((this: any, ...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return function executedFunction(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Image utilities
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file: File): string | null => {
  if (!FILE_LIMITS.SUPPORTED_IMAGE_TYPES.includes(file.type as typeof FILE_LIMITS.SUPPORTED_IMAGE_TYPES[number])) {
    return "Please select a valid image file (JPEG, PNG, or WebP)";
  }

  if (file.size > FILE_LIMITS.PROFILE_IMAGE_MAX_SIZE) {
    return VALIDATION_MESSAGES.IMAGE_TOO_LARGE;
  }

  return null;
};

// Array utilities
export const arrayToObject = <T extends Record<string, any>>(
  array: T[],
  keyField: keyof T
): Record<string, T> => {
  return array.reduce((obj, item) => {
    obj[item[keyField] as string] = item;
    return obj;
  }, {} as Record<string, T>);
};

export const groupBy = <T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(
  array: T[],
  keyFn: (item: T) => any,
  direction: "asc" | "desc" = "asc"
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T>(array: T[], keyFn: (item: T) => any): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// String utilities
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
};

export const unescapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
  };

  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (m) => map[m]);
};

export const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// URL utilities
export const getQueryParams = (url?: string): Record<string, string> => {
  const urlObj = new URL(url || window.location.href);
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
};

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

// Local storage utilities with error handling
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("Error accessing localStorage:", error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn("Error setting localStorage:", error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn("Error removing from localStorage:", error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn("Error clearing localStorage:", error);
      return false;
    }
  },
};

// Session storage utilities
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn("Error accessing sessionStorage:", error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn("Error setting sessionStorage:", error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn("Error removing from sessionStorage:", error);
      return false;
    }
  },
};

// Error handling utilities
export const createErrorObject = (
  message: string,
  code?: string,
  details?: any
) => ({
  message,
  code,
  details,
  timestamp: new Date().toISOString(),
});

export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === "NETWORK_ERROR" ||
    error?.message?.includes("network") ||
    error?.message?.includes("fetch")
  );
};

// Performance utilities
export const measurePerformance = async <T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (label) {
    console.info(`${label} took ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
};

// Retry utility
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

// Color utilities
export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Browser detection utilities
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

// Accessibility utilities
export const trapFocus = (element: HTMLElement): (() => void) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }

    if (e.key === "Escape") {
      element.blur();
    }
  };

  document.addEventListener("keydown", handleTabKey);

  // Return cleanup function
  return () => {
    document.removeEventListener("keydown", handleTabKey);
  };
};
