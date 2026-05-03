import { createContext, useContext, useState, ReactNode } from "react";

export interface BookData {
  title: string;
  audience: string;
  goal: string;
  genre: string;
  plan: string;
}

interface AppContextType {
  bookData: BookData | null;
  setBookData: (data: BookData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [bookData, setBookData] = useState<BookData | null>(null);

  return (
    <AppContext.Provider value={{ bookData, setBookData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
