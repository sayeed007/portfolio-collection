// src/lib/firebase/storage.ts
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app } from "./config";

const storage = getStorage(app);

export interface UploadResult {
  url: string;
  path: string;
}

export const uploadImage = async (
  file: File,
  path: string,
  userId: string
): Promise<UploadResult> => {
  try {
    // Create a reference to the file location
    const storageRef = ref(
      storage,
      `${path}/${userId}/${file.name}-${Date.now()}`
    );

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const deleteImage = async (imagePath: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

export const uploadProfileImage = async (
  file: File,
  userId: string
): Promise<string> => {
  const result = await uploadImage(file, "profile-images", userId);
  return result.url;
};

// Helper function to convert file to base64 (for small images stored in Firestore)
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Validate image file
export const validateImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const maxSize = 1 * 1024 * 1024; // 1MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please upload a valid image file (JPEG, PNG, or WebP)",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "Image size must be less than 1MB",
    };
  }

  return { isValid: true };
};

// // src/lib/firebase/storage.ts
// import {
//   getStorage,
//   ref,
//   uploadBytes,
//   getDownloadURL,
//   deleteObject,
// } from "firebase/storage";
// import app from "./config";

// const storage = getStorage(app);

// export interface UploadResult {
//   url: string;
//   path: string;
// }

// export const uploadProfileImage = async (
//   file: File,
//   userId: string
// ): Promise<UploadResult> => {
//   try {
//     // Create a reference to the file location
//     const fileExtension = file.name.split(".").pop();
//     const fileName = `profile-${Date.now()}.${fileExtension}`;
//     const storageRef = ref(storage, `profiles/${userId}/${fileName}`);

//     // Upload the file
//     const snapshot = await uploadBytes(storageRef, file);

//     // Get the download URL
//     const url = await getDownloadURL(snapshot.ref);

//     return {
//       url,
//       path: snapshot.ref.fullPath,
//     };
//   } catch (error) {
//     console.error("Error uploading profile image:", error);
//     throw new Error("Failed to upload profile image");
//   }
// };

// export const deleteProfileImage = async (imagePath: string): Promise<void> => {
//   try {
//     const imageRef = ref(storage, imagePath);
//     await deleteObject(imageRef);
//   } catch (error) {
//     console.error("Error deleting profile image:", error);
//     throw new Error("Failed to delete profile image");
//   }
// };

// // Convert file to base64 for Firestore storage (alternative approach)
// export const fileToBase64 = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => {
//       if (typeof reader.result === "string") {
//         resolve(reader.result);
//       } else {
//         reject(new Error("Failed to convert file to base64"));
//       }
//     };
//     reader.onerror = (error) => reject(error);
//   });
// };

// // Validate image file
// export const validateImageFile = (
//   file: File
// ): { isValid: boolean; error?: string } => {
//   const maxSize = 1024 * 1024; // 1MB
//   const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

//   if (!allowedTypes.includes(file.type)) {
//     return {
//       isValid: false,
//       error: "Please upload a valid image file (JPEG, PNG, or WebP)",
//     };
//   }

//   if (file.size > maxSize) {
//     return {
//       isValid: false,
//       error: "Image size must be less than 1MB",
//     };
//   }

//   return { isValid: true };
// };
