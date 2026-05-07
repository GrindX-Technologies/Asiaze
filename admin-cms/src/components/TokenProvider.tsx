"use client";

import React, { createContext, useContext } from "react";

const TokenContext = createContext<string>("");

export function TokenProvider({ children, token }: { children: React.ReactNode; token: string }) {
  return (
    <TokenContext.Provider value={token}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  return useContext(TokenContext);
}
