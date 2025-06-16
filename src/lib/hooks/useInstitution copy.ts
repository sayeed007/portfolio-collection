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
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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
const POPULAR_INSTITUTIONS = [
  // LIST OF INSTITUTION - I WILL ADD
  {
    name: "University of Dhaka",
    shortName: "DU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
];

export const useInstitution = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionRequests, setInstitutionRequests] = useState<
    InstitutionRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch institutions
  useEffect(() => {
    const institutionsQuery = query(
      collection(db, "institutions"),
      orderBy("type"),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(
      institutionsQuery,
      async (snapshot) => {
        const institutionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Institution[];

        setInstitutions(institutionsList);
        setLoading(false);

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
      },
      (error) => {
        console.error("Error fetching institutions:", error);
        setError("Failed to fetch institutions");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch institution requests
  useEffect(() => {
    const requestsQuery = query(
      collection(db, "institutionRequests"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const requestsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InstitutionRequest[];

        setInstitutionRequests(requestsList);
      },
      (error) => {
        console.error("Error fetching institution requests:", error);
        setError("Failed to fetch institution requests");
      }
    );

    return () => unsubscribe();
  }, []);

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

  // Request new institution (User function)
  const requestInstitution = async (formData: InstitutionRequestFormData) => {
    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.location.trim() ||
      !formData.division.trim() ||
      !formData.requestedByEmail.trim()
    ) {
      setError("Institution name, location, division, and email are required");
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
      await addDoc(collection(db, "institutionRequests"), {
        name: formData.name.trim(),
        shortName: formData.shortName?.trim() || null,
        type: formData.type,
        location: formData.location.trim(),
        division: formData.division,
        requestedBy: formData.requestedBy.trim(),
        requestedByEmail: formData.requestedByEmail.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSuccess(
        "Institution request submitted successfully. It will be reviewed by our admin team."
      );
      setTimeout(() => setSuccess(""), 5000);
      return true;
    } catch (error) {
      console.error("Error submitting institution request:", error);
      setError("Failed to submit institution request");
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
