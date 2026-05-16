"use client";

import { useEffect } from "react";
import { fetchSession } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";

export default function AuthBootstrap({ children }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchSession());
  }, [dispatch]);

  return children;
}
