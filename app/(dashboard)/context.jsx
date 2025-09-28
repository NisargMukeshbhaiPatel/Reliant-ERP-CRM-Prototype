"use client";
import { createContext, useContext, useState, useEffect } from "react";

const initialState = {
  user: null,
};

const DataContext = createContext(initialState);

export function DataProvider({ children, initialData }) {
  const [user, setUser] = useState(initialData.user || null);
  useEffect(() => {
    setUser(initialData.user || null);
  }, [initialData]);


  const value = {
    user,
    setUser,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

