import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, use, useContext, useEffect, useState } from "react";
import { decrypt, encrypt } from "./cryptoutils";

export type User = {
  userid: string;
  mandt: string;
  fullname: string;
  emailid: string;
  startdate: string;
  password: string;
  rolE_NM: string;
  contacT_NO: string;
  address: string;
  enddate: string;
  process: string;
  organization: string;
  flag: string;
  createdby: string;
  createddate: string;
  createdtime: string;
  changedby: string;
  changeddate: string;
  changedtime: string;
  bukrs: string;
  werks: string;
  source: string;
  loginflag: string;
  logindevice: string;
  lastlogindt: string;
  lastlogintm: string;
  userAuthorizations: UserAuthorization[]; 
};

export type UserAuthorization = {
  mandt: string;
  process: string;
  rolE_NM: string;
  menuname: string;
  path: string;
  menulevel: string;
  zposition: string;
  deL_FLAG: string;
};

type AuthContextType = {
  user: User | null;
  login: (userData: any, plainPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
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

  const resetPassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const currentDecrypted = decrypt(user.password);

      if (currentDecrypted !== oldPassword) {
        return false;
      }

      const updatedUser = {
        ...user,
        password: encrypt(newPassword),
      };

      await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      return true;
    } catch (e) {
      console.error("Reset password error:", e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};