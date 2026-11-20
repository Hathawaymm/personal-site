"use client";

import { createContext, useContext, type ReactNode } from "react";
import { seedCareerDocument, type CareerDocument } from "@/data/career-document";

const SEED = seedCareerDocument();
const CareerContext = createContext<CareerDocument>(SEED);

export function CareerProvider({ document, children }: { document: CareerDocument; children: ReactNode }) {
  return <CareerContext.Provider value={document}>{children}</CareerContext.Provider>;
}

export function useCareer(): CareerDocument {
  return useContext(CareerContext);
}
