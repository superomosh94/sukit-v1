"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SukitKernel } from "@sukit/core";

export interface SukitContextValue {
  sukit: SukitKernel;
}

const SukitContext = createContext<SukitContextValue | null>(null);

export interface SukitProviderProps {
  sukit: SukitKernel;
  children: ReactNode;
}

export function SukitProvider({ sukit, children }: SukitProviderProps) {
  return <SukitContext.Provider value={{ sukit }}>{children}</SukitContext.Provider>;
}

export function useSukitContext(): SukitContextValue {
  const ctx = useContext(SukitContext);
  if (!ctx) throw new Error("useSukitContext must be used within a SukitProvider");
  return ctx;
}

export function useSukit(): SukitKernel {
  return useSukitContext().sukit;
}
