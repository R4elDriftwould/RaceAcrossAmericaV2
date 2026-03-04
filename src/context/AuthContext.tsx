import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// -------------------------------------------------------
// This is the shape of the data we store after login.
// It matches what our AuthController sends back.
// -------------------------------------------------------
type AuthUser = {
  token: string;
  email: string;
  schoolId: number | null;
};

// -------------------------------------------------------
// This is what the context exposes to the rest of the app.
// Any component can call useAuth() to get these.
// -------------------------------------------------------
type AuthContextType = {
  user: AuthUser | null;       // null means not logged in
  login: (user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

// -------------------------------------------------------
// AuthProvider wraps your whole app (in App.tsx).
// It holds the token in state and also persists it to
// sessionStorage so a page refresh doesn't log you out.
// sessionStorage (not localStorage) clears when the
// browser tab closes, which is safer for a school setting.
// -------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // On first load, check if we saved a session already
    const saved = sessionStorage.getItem("auth");
    return saved ? JSON.parse(saved) : null;
  });

  // Keep sessionStorage in sync whenever user state changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("auth", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("auth");
    }
  }, [user]);

  const login = (userData: AuthUser) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user !== null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// -------------------------------------------------------
// useAuth() is the hook every component calls to access
// the context. The error here is a safety net — if you
// forget to wrap the app in AuthProvider it tells you
// immediately instead of silently failing.
// -------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}