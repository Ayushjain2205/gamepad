"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface VerifiedContextType {
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
}

const VerifiedContext = createContext<VerifiedContextType | undefined>(
  undefined
);

export const useVerified = () => {
  const context = useContext(VerifiedContext);
  if (context === undefined) {
    throw new Error("useVerified must be used within a VerifiedProvider");
  }
  return context;
};

interface VerifiedProviderProps {
  children: ReactNode;
}

export const VerifiedProvider = ({ children }: VerifiedProviderProps) => {
  const [isVerified, setIsVerified] = useState(false);

  // Load verification state from localStorage on mount
  useEffect(() => {
    const savedVerification = localStorage.getItem("isVerified");
    if (savedVerification === "true") {
      setIsVerified(true);
    }
  }, []);

  // Save verification state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("isVerified", isVerified.toString());

    // Apply CSS class to document body
    if (isVerified) {
      document.documentElement.classList.add("verified");
    } else {
      document.documentElement.classList.remove("verified");
    }
  }, [isVerified]);

  return (
    <VerifiedContext.Provider value={{ isVerified, setIsVerified }}>
      {children}
    </VerifiedContext.Provider>
  );
};
