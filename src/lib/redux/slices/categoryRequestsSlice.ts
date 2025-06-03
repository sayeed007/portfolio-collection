// src/lib/redux/slices/categoryRequestsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { CategoryRequest } from "../../types";
import {
  createCategoryRequest,
  getCategoryRequests,
  updateCategoryRequest,
} from "../../firebase/firestore";

interface CategoryRequestsState {
  requests: CategoryRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryRequestsState = {
  requests: [],
  loading: false,
  error: null,
};

// Async thunks
export const submitCategoryRequest = createAsyncThunk(
  "categoryRequests/submit",
  async (requestData: Omit<CategoryRequest, "id" | "createdAt">) => {
    const requestId = await createCategoryRequest(requestData);
    return {
      ...requestData,
      id: requestId,
      createdAt: new Date().toISOString(),
    };
  }
);

export const fetchCategoryRequests = createAsyncThunk(
  "categoryRequests/fetch",
  async () => {
    return await getCategoryRequests();
  }
);

export const updateRequestStatus = createAsyncThunk(
  "categoryRequests/updateStatus",
  async ({
    requestId,
    status,
    adminComment,
  }: {
    requestId: string;
    status: "Approved" | "Rejected";
    adminComment?: string;
  }) => {
    await updateCategoryRequest(requestId, { status, adminComment });
    return { requestId, status, adminComment };
  }
);

const categoryRequestsSlice = createSlice({
  name: "categoryRequests",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit request
      .addCase(submitCategoryRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCategoryRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.requests.unshift(action.payload);
      })
      .addCase(submitCategoryRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to submit request";
      })
      // Fetch requests
      .addCase(fetchCategoryRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchCategoryRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch requests";
      })
      // Update status
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const index = state.requests.findIndex(
          (req) => req.id === action.payload.requestId
        );
        if (index !== -1) {
          state.requests[index] = {
            ...state.requests[index],
            status: action.payload.status,
            adminComment: action.payload.adminComment,
          };
        }
      });
  },
});

export const { clearError } = categoryRequestsSlice.actions;
export default categoryRequestsSlice.reducer;
