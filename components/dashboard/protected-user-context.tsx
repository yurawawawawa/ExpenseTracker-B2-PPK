"use client";

import { createContext, useContext } from "react";

const ProtectedUserContext = createContext("");

export function ProtectedUserProvider({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return <ProtectedUserContext.Provider value={name}>{children}</ProtectedUserContext.Provider>;
}

export function useProtectedUserName() {
  return useContext(ProtectedUserContext);
}
