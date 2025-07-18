import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getAuth } from "firebase/auth";
import { useAuth } from "./useAuth";
import { POPULAR_INSTITUTIONS } from "../staticData/popularInstitutions";

export interface Institution {
  id: string;
  name: string;
  shortName?: string;
  type: string;
  location: string;
  division: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InstitutionRequest {
  id: string;
  name: string;
  shortName?: string;
  type: string;
  location: string;
  division: string;
  requestedBy: string;
  requestedByEmail: string;
  status: "pending" | "approved" | "rejected";
  adminComment?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InstitutionFormData {
  name: string;
  shortName: string;
  type: string;
  location: string;
  division: string;
  isActive: boolean;
  isVerified: boolean;
}

export interface InstitutionRequestFormData {
  name: string;
  shortName?: string;
  type: string;
  location: string;
  division: string;
  requestedBy: string;
  requestedByEmail: string;
}

export const useInstitution = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionRequests, setInstitutionRequests] = useState<
    InstitutionRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [institutionsInitialized, setInstitutionsInitialized] = useState(false);
  const [requestsInitialized, setRequestsInitialized] = useState(false);

  // Get the current user
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { isAdmin, loading: authLoading } = useAuth();

  // Fetch institutions
  useEffect(() => {
    const institutionsQuery = query(
      collection(db, "institutions"),
      orderBy("type"),
      orderBy("name", "asc")
    );

    // Set a timeout to ensure loading doesn't stay true forever
    const timeoutId = setTimeout(() => {
      if (!institutionsInitialized) {
        console.warn("Institutions loading timeout - setting to false");
        setInstitutionsInitialized(true);
      }
    }, 10000); // 10 second timeout

    const unsubscribe = onSnapshot(
      institutionsQuery,
      async (snapshot) => {
        try {
          const institutionsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Institution[];

          setInstitutions(institutionsList);
          setInstitutionsInitialized(true);

          // Prefill popular institutions if empty
          if (institutionsList.length === 0) {
            try {
              const batch = writeBatch(db);
              POPULAR_INSTITUTIONS.forEach((institution) => {
                const institutionRef = doc(collection(db, "institutions"));
                batch.set(institutionRef, {
                  name: institution.name,
                  shortName: institution.shortName,
                  type: institution.type,
                  location: institution.location,
                  division: institution.division,
                  isActive: institution.isActive,
                  isVerified: institution.isVerified,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
              });
              await batch.commit();
              setSuccess("Popular institutions added successfully");
              setTimeout(() => setSuccess(""), 3000);
            } catch (error) {
              console.error("Error prefilling institutions:", error);
              setError("Failed to prefill institutions");
            }
          }
        } catch (error) {
          console.error("Error processing institutions snapshot:", error);
          setError("Failed to process institutions data");
          setInstitutionsInitialized(true);
        }
      },
      (error) => {
        console.error("Error fetching institutions:", error);
        setError("Failed to fetch institutions");
        setInstitutionsInitialized(true);
      }
    );

    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [institutionsInitialized]);

  // Fetch institution requests
  useEffect(() => {
    // Don't start fetching requests until auth is loaded
    if (authLoading) {
      return;
    }

    // Set a timeout to ensure loading doesn't stay true forever
    const timeoutId = setTimeout(() => {
      if (!requestsInitialized) {
        console.warn("Institution requests loading timeout - setting to false");
        setRequestsInitialized(true);
      }
    }, 10000); // 10 second timeout

    if (!currentUser) {
      // If no user, just mark as initialized
      setRequestsInitialized(true);
      setInstitutionRequests([]);
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }

    let requestsQuery;

    try {
      if (isAdmin) {
        requestsQuery = query(
          collection(db, "institutionRequests"),
          orderBy("createdAt", "desc")
        );
      } else {
        requestsQuery = query(
          collection(db, "institutionRequests"),
          where("requestedBy", "==", currentUser.uid),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc")
        );
      }

      const unsubscribe = onSnapshot(
        requestsQuery,
        (snapshot) => {
          try {
            const requestsList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as InstitutionRequest[];

            setInstitutionRequests(requestsList);
            setRequestsInitialized(true);
          } catch (error) {
            console.error("Error processing requests snapshot:", error);
            setError("Failed to process institution requests data");
            setRequestsInitialized(true);
          }
        },
        (error) => {
          console.error("Error fetching institution requests:", error);
          setError("Failed to fetch institution requests");
          setRequestsInitialized(true);
        }
      );

      return () => {
        unsubscribe();
        if (timeoutId) clearTimeout(timeoutId);
      };
    } catch (error) {
      console.error("Error setting up requests query:", error);
      setError("Failed to setup institution requests query");
      setRequestsInitialized(true);
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [currentUser, isAdmin, authLoading, requestsInitialized]);

  // Update loading state based on both subscriptions
  useEffect(() => {
    const isLoading = !institutionsInitialized || (!authLoading && !requestsInitialized);
    setLoading(isLoading);
  }, [institutionsInitialized, requestsInitialized, authLoading]);

  // Add new institution (Admin function)
  const addInstitution = async (formData: InstitutionFormData) => {
    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.location.trim() ||
      !formData.division.trim()
    ) {
      setError("Institution name, location, and division are required");
      return false;
    }

    const existingInstitution = institutions.find(
      (institution) =>
        institution.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (existingInstitution) {
      setError("Institution name already exists");
      return false;
    }

    try {
      await addDoc(collection(db, "institutions"), {
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || null,
        type: formData.type,
        location: formData.location.trim(),
        division: formData.division,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSuccess("Institution added successfully");
      setTimeout(() => setSuccess(""), 3000);
      return true;
    } catch (error) {
      console.error("Error adding institution:", error);
      setError("Failed to add institution");
      return false;
    }
  };

  // Update existing institution (Admin function)
  const updateInstitution = async (
    id: string,
    formData: InstitutionFormData
  ) => {
    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.location.trim() ||
      !formData.division.trim()
    ) {
      setError("Institution name, location, and division are required");
      return false;
    }

    const existingInstitution = institutions.find(
      (institution) =>
        institution.name.toLowerCase() === formData.name.toLowerCase() &&
        institution.id !== id
    );

    if (existingInstitution) {
      setError("Institution name already exists");
      return false;
    }

    try {
      const institutionRef = doc(db, "institutions", id);
      await updateDoc(institutionRef, {
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || null,
        type: formData.type,
        location: formData.location.trim(),
        division: formData.division,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
        updatedAt: serverTimestamp(),
      });
      setSuccess("Institution updated successfully");
      setTimeout(() => setSuccess(""), 3000);
      return true;
    } catch (error) {
      console.error("Error updating institution:", error);
      setError("Failed to update institution");
      return false;
    }
  };

  // Delete institution (Admin function)
  const deleteInstitution = async (id: string) => {
    try {
      await deleteDoc(doc(db, "institutions", id));
      setSuccess("Institution deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
      return true;
    } catch (error) {
      console.error("Error deleting institution:", error);
      setError("Failed to delete institution");
      return false;
    }
  };

  // Toggle institution active status (Admin function)
  const toggleInstitutionStatus = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      const institutionRef = doc(db, "institutions", id);
      await updateDoc(institutionRef, {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error updating institution status:", error);
      setError("Failed to update institution status");
      return false;
    }
  };

  // Toggle institution verification (Admin function)
  const toggleInstitutionVerification = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      const institutionRef = doc(db, "institutions", id);
      await updateDoc(institutionRef, {
        isVerified: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error updating institution verification:", error);
      setError("Failed to update institution verification");
      return false;
    }
  };

  // Fixed requestInstitution function
  const requestInstitution = async (formData: InstitutionRequestFormData) => {
    setError("");
    setSuccess("");

    // Validate required fields
    if (
      !formData.name.trim() ||
      !formData.type.trim() ||
      !formData.location.trim() ||
      !formData.division.trim() ||
      !formData.requestedBy.trim() ||
      !formData.requestedByEmail.trim()
    ) {
      setError("All required fields must be filled");
      return false;
    }

    // Check if institution already exists
    const existingInstitution = institutions.find(
      (institution) =>
        institution.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (existingInstitution) {
      setError("Institution already exists in our database");
      return false;
    }

    // Check if there's already a pending request for this institution
    const existingRequest = institutionRequests.find(
      (request) =>
        request.name.toLowerCase() === formData.name.toLowerCase() &&
        request.status === "pending"
    );

    if (existingRequest) {
      setError("A request for this institution is already pending approval");
      return false;
    }

    try {
      // Prepare the data object with all required fields
      const requestData = {
        name: formData.name.trim(),
        shortName: formData.shortName?.trim() || null,
        type: formData.type.trim(),
        location: formData.location.trim(),
        division: formData.division.trim(),
        requestedBy: formData.requestedBy.trim(),
        requestedByEmail: formData.requestedByEmail.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.info("Submitting institution request with data:", requestData);

      await addDoc(collection(db, "institutionRequests"), requestData);

      setSuccess(
        "Institution request submitted successfully. It will be reviewed by our admin team."
      );
      setTimeout(() => setSuccess(""), 5000);
      return true;
    } catch (error) {
      console.error("Error submitting institution request:", error);
      setError("Failed to submit institution request. Please try again.");
      return false;
    }
  };

  // Handle institution request (Admin function)
  const handleInstitutionRequest = async (
    requestId: string,
    action: "approve" | "reject",
    adminComment?: string
  ) => {
    try {
      const request = institutionRequests.find((req) => req.id === requestId);
      if (!request) return false;

      if (action === "approve") {
        // Add to main institutions collection
        await addDoc(collection(db, "institutions"), {
          name: request.name,
          shortName: request.shortName || null,
          type: request.type,
          location: request.location,
          division: request.division,
          isActive: true,
          isVerified: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      const requestRef = doc(db, "institutionRequests", requestId);
      await updateDoc(requestRef, {
        status: action === "approve" ? "approved" : "rejected",
        adminComment: adminComment || null,
        updatedAt: serverTimestamp(),
      });

      setSuccess(`Institution request ${action}d successfully`);
      setTimeout(() => setSuccess(""), 3000);
      return true;
    } catch (error) {
      console.error("Error processing request:", error);
      setError("Failed to process request");
      return false;
    }
  };

  // Get institutions by filter
  const getInstitutionsByFilter = (filters: {
    type?: string;
    division?: string;
    isActive?: boolean;
    isVerified?: boolean;
    searchTerm?: string;
  }) => {
    return institutions.filter((institution) => {
      if (filters.type && institution.type !== filters.type) return false;
      if (filters.division && institution.division !== filters.division)
        return false;
      if (
        filters.isActive !== undefined &&
        institution.isActive !== filters.isActive
      )
        return false;
      if (
        filters.isVerified !== undefined &&
        institution.isVerified !== filters.isVerified
      )
        return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          institution.name.toLowerCase().includes(searchLower) ||
          institution.shortName?.toLowerCase().includes(searchLower) ||
          institution.location.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  // Get pending requests count
  const getPendingRequestsCount = () => {
    return institutionRequests.filter((req) => req.status === "pending").length;
  };

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return {
    // State
    institutions,
    institutionRequests,
    loading,
    error,
    success,
    isInitialized: institutionsInitialized && requestsInitialized,
    addInstitution,
    updateInstitution,
    deleteInstitution,
    toggleInstitutionStatus,
    toggleInstitutionVerification,
    requestInstitution,
    handleInstitutionRequest,
    getInstitutionsByFilter,
    getPendingRequestsCount,
    clearMessages,
  };
};