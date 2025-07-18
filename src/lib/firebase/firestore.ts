// src/lib/firebase/firestore.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Timestamp
} from "firebase/firestore";
import { CategoryRequest, Portfolio, PortfolioFilters, SkillCategory } from "../types";
import { db } from "./config";

// Portfolio operations
export const createPortfolio = async (
  userId: string,
  portfolioData: Omit<
    Portfolio,
    "userId" | "createdAt" | "updatedAt" | "visitCount"
  >
) => {
  const portfolioRef = doc(db, "users", userId, "portfolio", "data");
  const now = Timestamp.now();
  const portfolio: Portfolio = {
    ...portfolioData,
    userId,
    createdAt: now,
    updatedAt: now,
    visitCount: 0,
  };

  await setDoc(portfolioRef, portfolio);

  // If portfolio is public, also create/update it in the public portfolios collection
  if (portfolio.isPublic) {
    await syncToPublicCollection(userId, portfolio);
  }

  return portfolio;
};

export const updatePortfolio = async (
  userId: string,
  portfolioData: Partial<Portfolio>
): Promise<Portfolio> => {
  const portfolioRef = doc(db, "users", userId, "portfolio", "data");
  const updatedData = {
    ...portfolioData,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(portfolioRef, updatedData);

  // Get the full portfolio to check if it's public
  const fullPortfolio = await getPortfolio(userId);
  if (!fullPortfolio) {
    throw new Error("Portfolio not found");
  }

  const updatedPortfolio = { ...fullPortfolio, ...updatedData };

  if (updatedPortfolio.isPublic) {
    // Sync to public collection
    await syncToPublicCollection(userId, updatedPortfolio);
  } else {
    // Remove from public collection if it was made private
    await removeFromPublicCollection(userId);
  }

  return updatedPortfolio;
};

// export const getPortfolio = async (
//   userId: string
// ): Promise<Portfolio | null> => {
//   try {
//     const portfolioRef = doc(db, "users", userId, "portfolio", "data");
//     const portfolioSnap = await getDoc(portfolioRef);

//     if (portfolioSnap.exists()) {
//       return portfolioSnap.data() as Portfolio;
//     }

//     return null;
//   } catch (error) {
//     console.error("Error fetching portfolio:", error);
//     throw error;
//   }
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

    // Return null when no portfolio document exists
    return null;
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    throw error;
  }
};

export const deletePortfolio = async (userId: string) => {
  const batch = writeBatch(db);

  // Delete from user's private collection
  const portfolioRef = doc(db, "users", userId, "portfolio", "data");
  batch.delete(portfolioRef);

  // Delete from public collection if it exists
  const publicPortfolioRef = doc(db, "portfolios", userId);
  batch.delete(publicPortfolioRef);

  await batch.commit();
};

export const incrementPortfolioVisits = async (userId: string) => {
  const batch = writeBatch(db);

  // Update visit count in user's private collection
  const portfolioRef = doc(db, "users", userId, "portfolio", "data");
  batch.update(portfolioRef, {
    visitCount: increment(1),
  });

  // Update visit count in public collection if it exists
  const publicPortfolioRef = doc(db, "portfolios", userId);
  const publicPortfolioSnap = await getDoc(publicPortfolioRef);
  if (publicPortfolioSnap.exists()) {
    batch.update(publicPortfolioRef, {
      visitCount: increment(1),
    });
  }

  await batch.commit();
};

// Helper function to sync portfolio to public collection
const syncToPublicCollection = async (userId: string, portfolio: Portfolio) => {
  const publicPortfolioRef = doc(db, "portfolios", userId);
  await setDoc(publicPortfolioRef, {
    ...portfolio,
    id: userId, // Ensure the document has an id field
  });
};

// Helper function to remove portfolio from public collection
const removeFromPublicCollection = async (userId: string) => {
  const publicPortfolioRef = doc(db, "portfolios", userId);
  try {
    await deleteDoc(publicPortfolioRef);
  } catch (error) {
    // Document might not exist, which is fine
    console.error("Portfolio not found in public collection:", error);
  }
};

// Function to migrate existing portfolios to public collection (run once)
export const migrateExistingPortfolios = async () => {
  try {
    // This is a one-time migration function
    // You would run this once to migrate existing public portfolios
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    const batch = writeBatch(db);
    let migrationCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const portfolioRef = doc(db, "users", userId, "portfolio", "data");
      const portfolioSnap = await getDoc(portfolioRef);

      if (portfolioSnap.exists()) {
        const portfolio = portfolioSnap.data() as Portfolio;
        if (portfolio.isPublic) {
          const publicPortfolioRef = doc(db, "portfolios", userId);
          batch.set(publicPortfolioRef, {
            ...portfolio,
            id: userId,
          });
          migrationCount++;
        }
      }
    }

    await batch.commit();
    console.info(`Migration completed. Migrated ${migrationCount} public portfolios.`);
    return migrationCount;
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
};

export const getPublicPortfolios = async (filters?: PortfolioFilters): Promise<Portfolio[]> => {
  try {
    // Now we can efficiently query the public portfolios collection
    const portfoliosRef = collection(db, 'portfolios');
    const baseQuery = query(
      portfoliosRef,
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(1000)
    );

    const snapshot = await getDocs(baseQuery);

    if (snapshot.empty) {
      console.info('No public portfolios found');
      return [];
    }

    let portfolios: Portfolio[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Portfolio));

    // Apply client-side filters
    if (filters) {
      portfolios = applyClientSideFilters(portfolios, filters);
    }

    return portfolios;
  } catch (error) {
    console.error('Error fetching public portfolios:', error);

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('index')) {
        throw new Error('Database index missing. Please create a composite index for isPublic + updatedAt fields in the portfolios collection.');
      }
      if (error.message.includes('permission')) {
        throw new Error('Insufficient permissions to read portfolios.');
      }
    }

    throw new Error('Failed to fetch portfolios. Please try again later.');
  }
};

// Client-side filtering function (unchanged)
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
          portfolioSkill.skillId.toLowerCase().includes(skill.toLowerCase())
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
        portfolio.designation?.toLowerCase().includes(des.toLowerCase())
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

// Skill categories operations (unchanged)
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

// Category requests operations (unchanged)
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

// Updated real-time listeners
export const subscribeToPortfolios = (
  callback: (portfolios: Portfolio[]) => void
) => {
  const q = query(
    collection(db, "portfolios"), // Now using the public portfolios collection
    where("isPublic", "==", true),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const portfolios = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as Portfolio));
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