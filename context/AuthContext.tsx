import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { decrypt } from "./cryptoutils";

export type User = {
  userid: string;
  username?: string;
  fullname?: string;
  email?: string;
  role?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  login: (userData: any, plainPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem("authUser");
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (userData: any, plainPassword: string): Promise<boolean> => {
    try {
      const decryptedPassword = decrypt(userData.password);

      if (decryptedPassword === plainPassword) {
        await AsyncStorage.setItem("authUser", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login error:", e);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};