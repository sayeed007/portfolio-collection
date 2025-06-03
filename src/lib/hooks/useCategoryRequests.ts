// src/lib/hooks/useCategoryRequests.ts
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  submitCategoryRequest,
  fetchCategoryRequests,
  updateRequestStatus,
} from "../redux/slices/categoryRequestsSlice";
import { CategoryRequest } from "../types";

export const useCategoryRequests = () => {
  const dispatch = useDispatch<AppDispatch>();
  const categoryRequestsState = useSelector(
    (state: RootState) => state.categoryRequests
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Submit new category request
  const submitRequest = useCallback(
    (requestData: Omit<CategoryRequest, "id" | "createdAt" | "userId">) => {
      if (user?.uid) {
        return dispatch(
          submitCategoryRequest({ ...requestData, userId: user.uid })
        );
      }
      return Promise.reject(new Error("User not authenticated"));
    },
    [dispatch, user?.uid]
  );

  // Fetch all requests (admin only)
  const fetchRequests = useCallback(() => {
    return dispatch(fetchCategoryRequests());
  }, [dispatch]);

  // Update request status (admin only)
  const updateStatus = useCallback(
    (
      requestId: string,
      status: "Approved" | "Rejected",
      adminComment?: string
    ) => {
      return dispatch(updateRequestStatus({ requestId, status, adminComment }));
    },
    [dispatch]
  );

  useEffect(() => {
    // Fetch requests if user is admin
    if (user?.isAdmin && categoryRequestsState.requests.length === 0) {
      fetchRequests();
    }
  }, [user?.isAdmin, categoryRequestsState.requests.length, fetchRequests]);

  return {
    ...categoryRequestsState,
    submitRequest,
    fetchRequests,
    updateStatus,
  };
};
