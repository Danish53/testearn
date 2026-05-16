import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
}
