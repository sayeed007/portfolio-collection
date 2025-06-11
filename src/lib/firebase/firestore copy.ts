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
import { Portfolio, SkillCategory, CategoryRequest, PortfolioFilters } from "../types";

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

export const getPublicPortfolios = async (filters?: PortfolioFilters): Promise<Portfolio[]> => {
  try {
    // Base query - only filter by isPublic and orderBy updatedAt
    // This requires only ONE composite index: isPublic + updatedAt
    const portfoliosRef = collection(db, 'portfolios');
    const baseQuery = query(
      portfoliosRef,
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(1000) // Reasonable limit to prevent excessive data transfer
    );

    const snapshot = await getDocs(baseQuery);
    let portfolios: Portfolio[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Portfolio));

    // Apply filters client-side
    if (filters) {
      portfolios = applyClientSideFilters(portfolios, filters);
    }

    return portfolios;
  } catch (error) {
    console.error('Error fetching public portfolios:', error);
    throw error;
  }
};

// Client-side filtering function
const applyClientSideFilters = (portfolios: Portfolio[], filters: PortfolioFilters): Portfolio[] => {
  return portfolios.filter(portfolio => {
    // Experience range filter
    if (filters.experienceRange) {
      const experience = portfolio.yearsOfExperience || 0;
      if (experience < filters.experienceRange.min || experience > filters.experienceRange.max) {
        return false;
      }
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      const portfolioSkills = portfolio.technicalSkills?.flatMap(
        skillCategory => skillCategory.skills
      ) || [];
      const hasRequiredSkills = filters.skills.some(skill =>
        portfolioSkills.some(portfolioSkill =>
          portfolioSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (!hasRequiredSkills) return false;
    }

    // Nationality filter
    if (filters.nationality && filters.nationality.length > 0) {
      if (!filters.nationality.includes(portfolio.nationality || '')) {
        return false;
      }
    }

    // Designation filter
    if (filters.designation && filters.designation.length > 0) {
      if (!filters.designation.some(des =>
        portfolio.designation.toLowerCase().includes(des.toLowerCase())
      )) {
        return false;
      }
    }

    // Location filter
    if (filters.location && filters.location.length > 0) {
      if (!filters.location.includes(portfolio.location || '')) {
        return false;
      }
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const searchableText = [
        portfolio.employeeCode,
        portfolio.designation,
        portfolio.summary,
        portfolio.nationality,
        portfolio.location,
        ...(portfolio.technicalSkills?.flatMap(s => s.skills) || [])
      ].join(' ').toLowerCase();

      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
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
