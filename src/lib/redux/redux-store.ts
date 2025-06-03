// src/lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import authSlice from './slices/authSlice';
import portfolioSlice from './slices/portfolioSlice';
import skillCategoriesSlice from './slices/skillCategoriesSlice';
import categoryRequestsSlice from './slices/categoryRequestsSlice';
import uiSlice from './slices/uiSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and ui state
};

const rootReducer = combineReducers({
  auth: authSlice,
  portfolio: portfolioSlice,
  skillCategories: skillCategoriesSlice,
  categoryRequests: categoryRequestsSlice,
  ui: uiSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// src/lib/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types';
import { 
  signInWithEmail, 
  signUpWithEmailAndPassword, 
  signInWithGoogle, 
  logout,
  resetPassword,
} from '../../firebase/auth';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }: { email: string; password: string }) => {
    return await signInWithEmail(email, password);
  }
);

export const registerWithEmail = createAsyncThunk(
  'auth/registerWithEmail',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    return await signUpWithEmailAndPassword(email, password, displayName);
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async () => {
    return await signInWithGoogle();
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await logout();
  }
);

export const resetUserPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string) => {
    await resetPassword(email);
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with email
      .addCase(loginWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
      })
      // Register with email
      .addCase(registerWithEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
        state.isAuthenticated = false;
      })
      // Login with Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Google login failed';
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // Reset password
      .addCase(resetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Password reset failed';
      });
  },
});

export const { setUser, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;

// src/lib/redux/slices/portfolioSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Portfolio, PortfolioState, PortfolioFormData, PortfolioFilters } from '../../types';
import {
  createPortfolio,
  updatePortfolio,
  getPortfolio,
  deletePortfolio,
  getPublicPortfolios,
  incrementPortfolioVisits,
} from '../../firebase/firestore';

const initialFormData: PortfolioFormData = {
  step1: {
    personalInfo: {
      employeeCode: '',
      designation: '',
      yearsOfExperience: 0,
      nationality: '',
      languageProficiency: [],
      email: '',
      mobileNo: '',
      profileImage: '',
      summary: '',
    },
    references: [],
  },
  step2: {
    education: [],
    certifications: [],
    courses: [],
  },
  step3: {
    technicalSkills: [],
    workExperience: [],
  },
  step4: {
    projects: [],
  },
};

const initialState: PortfolioState = {
  currentPortfolio: null,
  portfolios: [],
  formData: initialFormData,
  currentStep: 1,
  loading: false,
  error: null,
  searchResults: [],
  filters: {},
};

// Async thunks
export const createUserPortfolio = createAsyncThunk(
  'portfolio/create',
  async ({ userId, portfolioData }: { userId: string; portfolioData: Omit<Portfolio, 'userId' | 'createdAt' | 'updatedAt' | 'visitCount'> }) => {
    return await createPortfolio(userId, portfolioData);
  }
);

export const updateUserPortfolio = createAsyncThunk(
  'portfolio/update',
  async ({ userId, portfolioData }: { userId: string; portfolioData: Partial<Portfolio> }) => {
    await updatePortfolio(userId, portfolioData);
    return portfolioData;
  }
);

export const fetchUserPortfolio = createAsyncThunk(
  'portfolio/fetch',
  async (userId: string) => {
    return await getPortfolio(userId);
  }
);

export const deleteUserPortfolio = createAsyncThunk(
  'portfolio/delete',
  async (userId: string) => {
    await deletePortfolio(userId);
    return userId;
  }
);

export const fetchPublicPortfolios = createAsyncThunk(
  'portfolio/fetchPublic',
  async (filters?: PortfolioFilters) => {
    return await getPublicPortfolios(filters);
  }
);

export const visitPortfolio = createAsyncThunk(
  'portfolio/visit',
  async (userId: string) => {
    await incrementPortfolioVisits(userId);
    return userId;
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateFormData: (state, action: PayloadAction<{ step: keyof PortfolioFormData; data: any }>) => {
      const { step, data } = action.payload;
      state.formData[step] = { ...state.formData[step], ...data };
    },
    resetFormData: (state) => {
      state.formData = initialFormData;
      state.currentStep = 1;
    },
    setFilters: (state, action: PayloadAction<PortfolioFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create portfolio
      .addCase(createUserPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPortfolio = action.payload;
        state.formData = initialFormData;
        state.currentStep = 1;
      })
      .addCase(createUserPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create portfolio';
      })
      // Update portfolio
      .addCase(updateUserPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentPortfolio) {
          state.currentPortfolio = { ...state.currentPortfolio, ...action.payload };
        }
      })
      .addCase(updateUserPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update portfolio';
      })
      // Fetch portfolio
      .addCase(fetchUserPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPortfolio = action.payload;
      })
      .addCase(fetchUserPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch portfolio';
      })
      // Delete portfolio
      .addCase(deleteUserPortfolio.fulfilled, (state) => {
        state.currentPortfolio = null;
        state.formData = initialFormData;
        state.currentStep = 1;
      })
      // Fetch public portfolios
      .addCase(fetchPublicPortfolios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicPortfolios.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolios = action.payload;
        state.searchResults = action.payload;
      })
      .addCase(fetchPublicPortfolios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch portfolios';
      });
  },
});

export const {
  setCurrentStep,
  updateFormData,
  resetFormData,
  setFilters,
  clearError,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;

// src/lib/redux/slices/skillCategoriesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SkillCategory, SkillCategoriesState } from '../../types';
import {
  getSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
} from '../../firebase/firestore';

const initialState: SkillCategoriesState = {
  categories: [],
  requests: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchSkillCategories = createAsyncThunk(
  'skillCategories/fetch',
  async () => {
    return await getSkillCategories();
  }
);

export const addSkillCategory = createAsyncThunk(
  'skillCategories/add',
  async (categoryData: Omit<SkillCategory, 'categoryId' | 'createdAt' | 'updatedAt'>) => {
    const categoryId = await createSkillCategory(categoryData);
    return { ...categoryData, categoryId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }
);

export const editSkillCategory = createAsyncThunk(
  'skillCategories/edit',
  async ({ categoryId, categoryData }: { categoryId: string; categoryData: Partial<SkillCategory> }) => {
    await updateSkillCategory(categoryId, categoryData);
    return { categoryId, ...categoryData };
  }
);

export const removeSkillCategory = createAsyncThunk(
  'skillCategories/remove',
  async (categoryId: string) => {
    await deleteSkillCategory(categoryId);
    return categoryId;
  }
);

const skillCategoriesSlice = createSlice({
  name: 'skillCategories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchSkillCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkillCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchSkillCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Add category
      .addCase(addSkillCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      // Edit category
      .addCase(editSkillCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(cat => cat.categoryId === action.payload.categoryId);
        if (index !== -1) {
          state.categories[index] = { ...state.categories[index], ...action.payload };
        }
      })
      // Remove category
      .addCase(removeSkillCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(cat => cat.categoryId !== action.payload);
      });
  },
});

export const { clearError } = skillCategoriesSlice.actions;
export default skillCategoriesSlice.reducer;

// src/lib/redux/slices/categoryRequestsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CategoryRequest } from '../../types';
import {
  createCategoryRequest,
  getCategoryRequests,
  updateCategoryRequest,
} from '../../firebase/firestore';

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
  'categoryRequests/submit',
  async (requestData: Omit<CategoryRequest, 'id' | 'createdAt'>) => {
    const requestId = await createCategoryRequest(requestData);
    return { ...requestData, id: requestId, createdAt: new Date().toISOString() };
  }
);

export const fetchCategoryRequests = createAsyncThunk(
  'categoryRequests/fetch',
  async () => {
    return await getCategoryRequests();
  }
);

export const updateRequestStatus = createAsyncThunk(
  'categoryRequests/updateStatus',
  async ({ requestId, status, adminComment }: { requestId: string; status: 'Approved' | 'Rejected'; adminComment?: string }) => {
    await updateCategoryRequest(requestId, { status, adminComment });
    return { requestId, status, adminComment };
  }
);

const categoryRequestsSlice = createSlice({
  name: 'categoryRequests',
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
        state.error = action.error.message || 'Failed to submit request';
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
        state.error = action.error.message || 'Failed to fetch requests';
      })
      // Update status
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const index = state.requests.findIndex(req => req.id === action.payload.requestId);
        if (index !== -1) {
          state.requests[index] = { 
            ...state.requests[index], 
            status: action.payload.status,
            adminComment: action.payload.adminComment 
          };
        }
      });
  },
});

export const { clearError } = categoryRequestsSlice.actions;
export default categoryRequestsSlice.reducer;

// src/lib/redux/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
  }>;
  loading: Record<string, boolean>;
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  loading: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      state.notifications.unshift(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notif => notif.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      const { key, loading } = action.payload;
      state.loading[key] = loading;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;