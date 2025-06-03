import { useEffect, useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  fetchUserPortfolio,
  fetchPublicPortfolios,
  createUserPortfolio,
  updateUserPortfolio,
  deleteUserPortfolio,
  visitPortfolio,
  setCurrentStep,
  updateFormData,
  resetFormData,
  setFilters,
  clearError,
} from "../redux/slices/portfolioSlice";
import { Portfolio, PortfolioFormData, PortfolioFilters } from "../types";

export const usePortfolio = () => {
  const dispatch = useDispatch<AppDispatch>();
  const portfolioState = useSelector((state: RootState) => state.portfolio);
  const { user } = useSelector((state: RootState) => state.auth);

  // Track fetch state to prevent infinite loops
  const [fetchState, setFetchState] = useState<{
    attempted: boolean;
    userId: string | null;
    completed: boolean;
  }>({
    attempted: false,
    userId: null,
    completed: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset fetch state when user changes
  useEffect(() => {
    if (user?.uid !== fetchState.userId) {
      setFetchState({
        attempted: false,
        userId: user?.uid || null,
        completed: false,
      });
    }
  }, [user?.uid, fetchState.userId]);

  // Memoized portfolio getter with error handling
  const getPortfolio = useCallback(
    async (portfolioId: string) => {
      try {
        const result = await dispatch(fetchUserPortfolio(portfolioId));
        if (fetchUserPortfolio.fulfilled.match(result)) {
          return result.payload;
        }
        throw new Error(result.payload as string);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Fetch current user's portfolio
  const fetchMyPortfolio = useCallback(async () => {
    if (!user?.uid) {
      console.warn("No user ID available for portfolio fetch");
      return null;
    }

    if (portfolioState.loading) {
      console.log("Portfolio fetch already in progress");
      return null;
    }

    try {
      console.log("Fetching portfolio for user:", user.uid);
      const result = await dispatch(fetchUserPortfolio(user.uid));

      if (fetchUserPortfolio.fulfilled.match(result)) {
        console.log("Portfolio fetched successfully");
        return result.payload;
      } else if (fetchUserPortfolio.rejected.match(result)) {
        const errorMessage = result.payload as string;
        console.log("Portfolio fetch rejected:", errorMessage);

        if (errorMessage === "No portfolio found") {
          console.log(
            "No portfolio found for user - this is expected for new users"
          );
          return null;
        }

        throw new Error(errorMessage || "Failed to fetch portfolio");
      }

      return result.payload;
    } catch (error) {
      console.error("Error in fetchMyPortfolio:", error);
      throw error;
    }
  }, [user?.uid, portfolioState.loading, dispatch]);

  // Auto-fetch user portfolio with improved logic
  useEffect(() => {
    if (
      !user?.uid ||
      fetchState.attempted ||
      fetchState.completed ||
      portfolioState.loading
    ) {
      return;
    }

    // Mark as attempted immediately to prevent multiple calls
    setFetchState((prev) => ({ ...prev, attempted: true }));

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to prevent hanging
    timeoutRef.current = setTimeout(() => {
      console.log("Portfolio fetch timeout reached");
      setFetchState((prev) => ({ ...prev, completed: true }));
    }, 15000);

    const fetchPortfolioAsync = async () => {
      try {
        await fetchMyPortfolio();
      } catch (error) {
        if (error instanceof Error && error.message !== "No portfolio found") {
          console.error("Auto-fetch portfolio error:", error);
        }
      } finally {
        setFetchState((prev) => ({ ...prev, completed: true }));
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    fetchPortfolioAsync();
  }, [user?.uid, fetchState, portfolioState.loading, fetchMyPortfolio]);

  // Fetch public portfolios
  const fetchPortfolios = useCallback(
    async (filters?: PortfolioFilters) => {
      try {
        const result = await dispatch(fetchPublicPortfolios(filters));
        if (fetchPublicPortfolios.fulfilled.match(result)) {
          return result.payload;
        }
        throw new Error(result.payload as string);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Create portfolio
  const createPortfolio = useCallback(
    async (
      portfolioData: Omit<
        Portfolio,
        "userId" | "createdAt" | "updatedAt" | "visitCount"
      >
    ) => {
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      try {
        const result = await dispatch(
          createUserPortfolio({
            userId: user.uid,
            portfolioData,
          })
        );

        if (createUserPortfolio.fulfilled.match(result)) {
          // Reset fetch state to allow re-fetch
          setFetchState((prev) => ({
            ...prev,
            attempted: false,
            completed: false,
          }));
          return result.payload;
        } else {
          throw new Error(result.payload as string);
        }
      } catch (error) {
        console.error("Error creating portfolio:", error);
        throw error;
      }
    },
    [user?.uid, dispatch]
  );

  // Update portfolio
  const updatePortfolio = useCallback(
    async (portfolioData: Partial<Portfolio>) => {
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      try {
        const result = await dispatch(
          updateUserPortfolio({
            userId: user.uid,
            portfolioData,
          })
        );

        if (updateUserPortfolio.fulfilled.match(result)) {
          return result.payload;
        } else {
          throw new Error(result.payload as string);
        }
      } catch (error) {
        console.error("Error updating portfolio:", error);
        throw error;
      }
    },
    [user?.uid, dispatch]
  );

  // Delete portfolio
  const deletePortfolio = useCallback(async () => {
    if (!user?.uid) {
      throw new Error("User not authenticated");
    }

    try {
      const result = await dispatch(deleteUserPortfolio(user.uid));

      if (deleteUserPortfolio.fulfilled.match(result)) {
        // Reset fetch state after deletion
        setFetchState((prev) => ({
          ...prev,
          attempted: false,
          completed: false,
        }));
        return result.payload;
      } else {
        throw new Error(result.payload as string);
      }
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      throw error;
    }
  }, [user?.uid, dispatch]);

  // Visit portfolio (increment visit count)
  const recordVisit = useCallback(
    async (userId: string) => {
      try {
        const result = await dispatch(visitPortfolio(userId));
        if (visitPortfolio.fulfilled.match(result)) {
          return result.payload;
        }
        throw new Error(result.payload as string);
      } catch (error) {
        console.error("Error recording visit:", error);
        throw error;
      }
    },
    [dispatch]
  );

  // Form management
  const setStep = useCallback(
    (step: number) => {
      dispatch(setCurrentStep(step));
    },
    [dispatch]
  );

  const updateStep = useCallback(
    (step: keyof PortfolioFormData, data: any) => {
      dispatch(updateFormData({ [step]: data }));
    },
    [dispatch]
  );

  const resetForm = useCallback(() => {
    dispatch(resetFormData());
  }, [dispatch]);

  // Filters
  const setPortfolioFilters = useCallback(
    (filters: PortfolioFilters) => {
      dispatch(setFilters(filters));
    },
    [dispatch]
  );

  // Clear errors
  const clearPortfolioError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Manual retry function
  const retryFetch = useCallback(async () => {
    setFetchState((prev) => ({ ...prev, attempted: false, completed: false }));
    dispatch(clearError());

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return fetchMyPortfolio();
  }, [fetchMyPortfolio, dispatch]);

  // Helper functions
  const isPortfolioNotFound = useCallback(() => {
    return (
      !portfolioState.loading &&
      !portfolioState.currentPortfolio &&
      portfolioState.error === "No portfolio found"
    );
  }, [
    portfolioState.loading,
    portfolioState.currentPortfolio,
    portfolioState.error,
  ]);

  const shouldShowLoading = useCallback(() => {
    return portfolioState.loading && !isPortfolioNotFound();
  }, [portfolioState.loading, isPortfolioNotFound]);

  const hasPortfolio = useCallback(() => {
    return !!portfolioState.currentPortfolio;
  }, [portfolioState.currentPortfolio]);

  return {
    // State
    currentPortfolio: portfolioState.currentPortfolio,
    portfolios: portfolioState.portfolios,
    loading: portfolioState.loading,
    error: portfolioState.error,
    formData: portfolioState.formData,
    currentStep: portfolioState.currentStep,
    filters: portfolioState.filters,
    isSubmitting: portfolioState.isSubmitting,
    isSaving: portfolioState.isSaving,
    submitError: portfolioState.submitError,
    isEditing: portfolioState.isEditing,
    stepValidation: portfolioState.stepValidation,

    // Actions
    getPortfolio,
    fetchMyPortfolio,
    fetchPortfolios,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    recordVisit,
    setStep,
    updateStep,
    resetForm,
    setPortfolioFilters,
    clearPortfolioError,
    retryFetch,

    // Helper functions
    isPortfolioNotFound: isPortfolioNotFound(),
    shouldShowLoading: shouldShowLoading(),
    hasPortfolio: hasPortfolio(),
  };
};
