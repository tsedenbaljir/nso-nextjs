"use client";

import { createContext, useContext, type ReactNode } from "react";

type Resolved = "light" | "dark";

const ThemeContext = createContext<{ resolved: Resolved }>({ resolved: "light" });

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ resolved: "light" }}>
      <div className="nso-price-dash">{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
