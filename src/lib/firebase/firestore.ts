// src/lib/firebase/firestore.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  addDoc,
  onSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import { Portfolio, SkillCategory, CategoryRequest } from "../types";

// Portfolio operations
export const createPortfolio = async (
  userId: string,
  portfolioData: Omit<
    Portfolio,
    "userId" | "createdAt" | "updatedAt" | "visitCount"
  >
) => {
  const portfolioRef = doc(db, "users", userId, "portfolio", "data");
  const portfolio: Portfolio = {
    ...portfolioData,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visitCount: 0,
  };

  await setDoc(portfolioRef, portfolio);
  return portfolio;
};

export const updatePortfolio = async (
  userId: string,
  portfolioData: Partial<Portfolio>
) => {
  const portfolioRef = doc(db, "users", userId, "portfolio", "data");
  await updateDoc(portfolioRef, {
    ...portfolioData,
    updatedAt: new Date().toISOString(),
  });
};

// export const getPortfolio = async (
//   userId: string
// ): Promise<Portfolio | null> => {
//   const portfolioRef = doc(db, "users", userId, "portfolio", "data");
//   const portfolioSnap = await getDoc(portfolioRef);

//   debugger;
//   if (portfolioSnap.exists()) {
//     return portfolioSnap.data() as Portfolio;
//   }
//   return null;
// };
export const getPortfolio = async (
  userId: string
): Promise<Portfolio | null> => {
  try {
    const portfolioRef = doc(db, "users", userId, "portfolio", "data");
    const portfolioSnap = await getDoc(portfolioRef);

    if (portfolioSnap.exists()) {
      return portfolioSnap.data() as Portfolio;
    }

    // Return null for non-existent portfolio (not an error)
    return null;
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    throw error;
  }
};

export const deletePortfolio = async (userId: string) => {
  const portfolioRef = doc(db, "users", userId, "portfolio", "data");
  await deleteDoc(portfolioRef);
};

export const incrementPortfolioVisits = async (userId: string) => {
  const portfolioRef = doc(db, "users", userId, "portfolio", "data");
  await updateDoc(portfolioRef, {
    visitCount: increment(1),
  });
};

export const getPublicPortfolios = async (
  filters?: any
): Promise<Portfolio[]> => {
  const constraints: QueryConstraint[] = [
    where("isPublic", "==", true),
    orderBy("updatedAt", "desc"),
  ];

  if (filters?.yearsOfExperience) {
    constraints.push(
      where("personalInfo.yearsOfExperience", ">=", filters.yearsOfExperience)
    );
  }

  const q = query(collection(db, "portfolios"), ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => doc.data() as Portfolio);
};

// Skill categories operations
export const getSkillCategories = async (): Promise<SkillCategory[]> => {
  const q = query(
    collection(db, "skillCategories"),
    where("approved", "==", true),
    orderBy("name")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        categoryId: doc.id,
        ...doc.data(),
      } as SkillCategory)
  );
};

export const createSkillCategory = async (
  categoryData: Omit<SkillCategory, "categoryId" | "createdAt" | "updatedAt">
) => {
  const categoryRef = await addDoc(collection(db, "skillCategories"), {
    ...categoryData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return categoryRef.id;
};

export const updateSkillCategory = async (
  categoryId: string,
  categoryData: Partial<SkillCategory>
) => {
  const categoryRef = doc(db, "skillCategories", categoryId);
  await updateDoc(categoryRef, {
    ...categoryData,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteSkillCategory = async (categoryId: string) => {
  const categoryRef = doc(db, "skillCategories", categoryId);
  await deleteDoc(categoryRef);
};

// Category requests operations
export const createCategoryRequest = async (
  requestData: Omit<CategoryRequest, "id" | "createdAt">
) => {
  const requestRef = await addDoc(collection(db, "categoryRequests"), {
    ...requestData,
    createdAt: new Date().toISOString(),
  });

  return requestRef.id;
};

export const getCategoryRequests = async (): Promise<CategoryRequest[]> => {
  const q = query(
    collection(db, "categoryRequests"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as CategoryRequest)
  );
};

export const updateCategoryRequest = async (
  requestId: string,
  updateData: Partial<CategoryRequest>
) => {
  const requestRef = doc(db, "categoryRequests", requestId);
  await updateDoc(requestRef, updateData);
};

// Real-time listeners
export const subscribeToPortfolios = (
  callback: (portfolios: Portfolio[]) => void
) => {
  const q = query(
    collection(db, "portfolios"),
    where("isPublic", "==", true),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const portfolios = querySnapshot.docs.map((doc) => doc.data() as Portfolio);
    callback(portfolios);
  });
};

export const subscribeToSkillCategories = (
  callback: (categories: SkillCategory[]) => void
) => {
  const q = query(
    collection(db, "skillCategories"),
    where("approved", "==", true),
    orderBy("name")
  );

  return onSnapshot(q, (querySnapshot) => {
    const categories = querySnapshot.docs.map(
      (doc) =>
        ({
          categoryId: doc.id,
          ...doc.data(),
        } as SkillCategory)
    );
    callback(categories);
  });
};
