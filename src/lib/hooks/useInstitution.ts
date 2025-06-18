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
  // Public Universities
  {
    name: "University of Dhaka",
    shortName: "DU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Bangladesh University of Engineering and Technology",
    shortName: "BUET",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "University of Chittagong",
    shortName: "CU",
    type: "University",
    location: "Chittagong",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "University of Rajshahi",
    shortName: "RU",
    type: "University",
    location: "Rajshahi",
    division: "Rajshahi",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Jahangirnagar University",
    shortName: "JU",
    type: "University",
    location: "Savar",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Bangladesh Agricultural University",
    shortName: "BAU",
    type: "University",
    location: "Mymensingh",
    division: "Mymensingh",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Khulna University",
    shortName: "KU",
    type: "University",
    location: "Khulna",
    division: "Khulna",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Shahjalal University of Science and Technology",
    shortName: "SUST",
    type: "University",
    location: "Sylhet",
    division: "Sylhet",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Islamic University",
    shortName: "IU",
    type: "University",
    location: "Kushtia",
    division: "Khulna",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Jagannath University",
    shortName: "JnU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Barisal University",
    shortName: "BU",
    type: "University",
    location: "Barisal",
    division: "Barisal",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Comilla University",
    shortName: "CoU",
    type: "University",
    location: "Comilla",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Jatiya Kabi Kazi Nazrul Islam University",
    shortName: "JKKNIU",
    type: "University",
    location: "Mymensingh",
    division: "Mymensingh",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Begum Rokeya University",
    shortName: "BRUR",
    type: "University",
    location: "Rangpur",
    division: "Rangpur",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Hajee Mohammad Danesh Science and Technology University",
    shortName: "HSTU",
    type: "University",
    location: "Dinajpur",
    division: "Rangpur",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Mawlana Bhashani Science and Technology University",
    shortName: "MBSTU",
    type: "University",
    location: "Tangail",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Noakhali Science and Technology University",
    shortName: "NSTU",
    type: "University",
    location: "Noakhali",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Jessore University of Science and Technology",
    shortName: "JUST",
    type: "University",
    location: "Jessore",
    division: "Khulna",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Pabna University of Science and Technology",
    shortName: "PUST",
    type: "University",
    location: "Pabna",
    division: "Rajshahi",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Patuakhali Science and Technology University",
    shortName: "PSTU",
    type: "University",
    location: "Patuakhali",
    division: "Barisal",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Rangamati Science and Technology University",
    shortName: "RMSTU",
    type: "University",
    location: "Rangamati",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Sylhet Agricultural University",
    shortName: "SAU",
    type: "University",
    location: "Sylhet",
    division: "Sylhet",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Sher-e-Bangla Agricultural University",
    shortName: "SBAU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Bangabandhu Sheikh Mujibur Rahman Agricultural University",
    shortName: "BSMRAU",
    type: "University",
    location: "Gazipur",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },

  // Private Universities
  {
    name: "North South University",
    shortName: "NSU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "BRAC University",
    shortName: "VU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Independent University, Bangladesh",
    shortName: "IUB",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "American International University-Bangladesh",
    shortName: "AIU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "United International University",
    shortName: "UIU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "East West University",
    shortName: "EWU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Daffodil International University",
    shortName: "DIU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Ahsanullah University of Science and Technology",
    shortName: "AUST",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Southeast University",
    shortName: "SEU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "University of Asia Pacific",
    shortName: "UAP",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Stamford University Bangladesh",
    shortName: "SUB",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Bangladesh University of Business and Technology",
    shortName: "BUBT",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Metropolitan University",
    shortName: "MU",
    type: "University",
    location: "Sylhet",
    division: "Sylhet",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Premier University",
    shortName: "PU",
    type: "University",
    location: "Chittagong",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "International University of Business Agriculture and Technology",
    shortName: "IUBAT",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Eastern University",
    shortName: "EU",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Green University of Bangladesh",
    shortName: "GUB",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "World University of Bangladesh",
    shortName: "WUB",
    type: "University",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },

  // Medical Colleges
  {
    name: "Dhaka Medical College",
    shortName: "DMC",
    type: "Medical College",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Chittagong Medical College",
    shortName: "CMC",
    type: "Medical College",
    location: "Chittagong",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Rajshahi Medical College",
    shortName: "RMC",
    type: "Medical College",
    location: "Rajshahi",
    division: "Rajshahi",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Sylhet MAG Osmani Medical College",
    shortName: "SOMC",
    type: "Medical College",
    location: "Sylhet",
    division: "Sylhet",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Mymensingh Medical College",
    shortName: "MMC",
    type: "Medical College",
    location: "Mymensingh",
    division: "Mymensingh",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Sir Salimullah Medical College",
    shortName: "SSMC",
    type: "Medical College",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Sher-E-Bangla Medical College",
    shortName: "SBMC",
    type: "Medical College",
    location: "Barisal",
    division: "Barisal",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Rangpur Medical College",
    shortName: "RpMC",
    type: "Medical College",
    location: "Rangpur",
    division: "Rangpur",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Dinajpur Medical College",
    shortName: "DjMC",
    type: "Medical College",
    location: "Dinajpur",
    division: "Rangpur",
    isActive: true,
    isVerified: true,
  },

  // Engineering Colleges
  {
    name: "Chittagong University of Engineering & Technology",
    shortName: "CUET",
    type: "Engineering College",
    location: "Chittagong",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Rajshahi University of Engineering & Technology",
    shortName: "RUET",
    type: "Engineering College",
    location: "Rajshahi",
    division: "Rajshahi",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Khulna University of Engineering & Technology",
    shortName: "KUET",
    type: "Engineering College",
    location: "Khulna",
    division: "Khulna",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Dhaka University of Engineering & Technology",
    shortName: "DUET",
    type: "Engineering College",
    location: "Gazipur",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Military Institute of Science and Technology",
    shortName: "MIST",
    type: "Engineering College",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },

  // Colleges
  {
    name: "Dhaka College",
    shortName: "DC",
    type: "College",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Notre Dame College",
    shortName: "NDC",
    type: "College",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Holy Cross College",
    shortName: "HCC",
    type: "College",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Adamjee Cantonment College",
    shortName: "ACC",
    type: "College",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Chittagong College",
    shortName: "CC",
    type: "College",
    location: "Chittagong",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Rajshahi College",
    shortName: "RC",
    type: "College",
    location: "Rajshahi",
    division: "Rajshahi",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Government Edward College",
    shortName: "GEC",
    type: "College",
    location: "Pabna",
    division: "Rajshahi",
    isActive: true,
    isVerified: true,
  },
  {
    name: "MC College",
    shortName: "MCC",
    type: "College",
    location: "Sylhet",
    division: "Sylhet",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Ananda Mohan College",
    shortName: "AMC",
    type: "College",
    location: "Mymensingh",
    division: "Mymensingh",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Carmichael College",
    shortName: "CC",
    type: "College",
    location: "Rangpur",
    division: "Rangpur",
    isActive: true,
    isVerified: true,
  },

  // Schools
  {
    name: "Dhaka Residential Model College",
    shortName: "DRMC",
    type: "School",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Viqarunnisa Noon School and College",
    shortName: "VNS",
    type: "School",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Holy Cross Girls High School",
    shortName: "HCGHS",
    type: "School",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "St. Gregory's High School",
    shortName: "SGHS",
    type: "School",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Scholastica School",
    shortName: "SS",
    type: "School",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Maple Leaf International School",
    shortName: "MLIS",
    type: "School",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Chittagong Grammar School",
    shortName: "CGS",
    type: "School",
    location: "Chittagong",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Ideal School and College",
    shortName: "ISC",
    type: "School",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Motijheel Government Boys' High School",
    shortName: "MGBHS",
    type: "School",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Sylhet Government Pilot High School",
    shortName: "SGPHS",
    type: "School",
    location: "Sylhet",
    division: "Sylhet",
    isActive: true,
    isVerified: true,
  },

  // Technical Institutes
  {
    name: "Dhaka Polytechnic Institute",
    shortName: "DPI",
    type: "Technical Institute",
    location: "Dhaka",
    division: "Dhaka",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Chittagong Polytechnic Institute",
    shortName: "CPI",
    type: "Technical Institute",
    location: "Chittagong",
    division: "Chittagong",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Rajshahi Polytechnic Institute",
    shortName: "RPI",
    type: "Technical Institute",
    location: "Rajshahi",
    division: "Rajshahi",
    isActive: true,
    isVerified: true,
  },
  {
    name: "Khulna Polytechnic Institute",
    shortName: "KPI",
    type: "Technical Institute",
    location: "Khulna",
    division: "Khulna",
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

  // Get the current user
  const auth = getAuth();
  const currentUser = auth.currentUser;

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
  // useEffect(() => {
  //   const requestsQuery = query(
  //     collection(db, "institutionRequests"),
  //     orderBy("createdAt", "desc")
  //   );

  //   const unsubscribe = onSnapshot(
  //     requestsQuery,
  //     (snapshot) => {
  //       const requestsList = snapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       })) as InstitutionRequest[];

  //       setInstitutionRequests(requestsList);
  //     },
  //     (error) => {
  //       console.error("Error fetching institution requests:", error);
  //       setError("Failed to fetch institution requests");
  //     }
  //   );

  //   return () => unsubscribe();
  // }, []);
  useEffect(() => {
    if (!currentUser) {
      setError("User must be signed in to view institution requests");
      setLoading(false);
      return;
    }

    const requestsQuery = query(
      collection(db, "institutionRequests"),
      where("requestedBy", "==", currentUser.uid), // Filter by current user's UID
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
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching institution requests:", error);
        setError("Failed to fetch institution requests");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

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
