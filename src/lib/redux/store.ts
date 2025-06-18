// src/lib/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authSlice from "./slices/authSlice";
import categoryRequestsSlice from "./slices/categoryRequestsSlice";
import portfolioSlice from "./slices/portfolioSlice";
import skillCategoriesSlice from "./slices/skillCategoriesSlice";
import uiSlice from "./slices/uiSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "ui"], // Only persist auth and ui state
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
        // ignoredPaths: ['payload.createdAt', 'payload.updatedAt'],
        // ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
