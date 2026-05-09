import { createContext, useContext, useState, ReactNode } from "react";
import type { DHMResult } from "@workspace/dhm-engine";

export interface BookData {
  title: string;
  audience: string;
  goal: string;
  genre: string;
  plan: string;
  /** Slash-separated chapter syntax matrix (e.g. SYA or SYA/YAA/AYA); defaults to SYA when absent */
  chapterSyntaxMatrix?: string;
  /** Rotate SAY order by chapter from the template (default true when absent). */
  syntaxVaryPerChapter?: boolean;
  /** Keep Story (S) first in every strand when varying (SYA/SAY alternation). */
  syntaxAlwaysLeadWithStory?: boolean;
  /** Present after generation; optional for older client sessions */
  dhm?: DHMResult;
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
