"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, WorkspaceBrandConfig, ProfileUpdatePayload } from "@/types";
import { api } from "@/lib/api";

export const DEFAULT_WORKSPACE_BRAND: WorkspaceBrandConfig = {
  name: "GeneWise",
  subtitle: "Clinical-grade genetics literacy",
  badge: "v2.4 CLINVAR",
  logoKey: "pulse",
};

const PROFILE_OVERRIDES_KEY = "medipredict_profile_overrides";
const WORKSPACE_BRAND_KEY = "medipredict_workspace_brand";

export interface AuthActionOptions {
  skipRedirect?: boolean;
  redirectTo?: string;
}

export interface PhoneLoginMeta extends AuthActionOptions {
  full_name?: string;
  role?: "clinician" | "patient" | "admin";
  specialty?: string;
}

export interface AuthContextType {
  user: User | null;
  workspaceBrand: WorkspaceBrandConfig;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, options?: AuthActionOptions) => Promise<User>;
  loginWithPhone: (phone: string, otp: string, meta?: PhoneLoginMeta) => Promise<User>;
  register: (
    data: { email: string; password: string; full_name: string; phone?: string; role?: string },
    options?: AuthActionOptions
  ) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (role: "clinician" | "patient" | "admin") => Promise<User>;
  updateProfile: (updates: ProfileUpdatePayload) => Promise<User>;
  verifyAndBindPhone: (phone: string, otp: string) => Promise<User>;
  updateWorkspaceBrand: (brand: Partial<WorkspaceBrandConfig>) => WorkspaceBrandConfig;
  resetWorkspaceDefaults: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

function readJsonStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

function mergeWithProfileOverrides(baseUser: User): User {
  const overrides = readJsonStorage<Partial<User>>(PROFILE_OVERRIDES_KEY, {});
  const cleanOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<User>;

  return {
    ...baseUser,
    ...cleanOverrides,
    // Prefer explicitly provided user fields if overrides didn't customize name/phone for another role
    full_name: cleanOverrides.full_name || baseUser.full_name || "Clinical Explorer",
    phone: cleanOverrides.phone || baseUser.phone,
    phone_verified: cleanOverrides.phone_verified ?? baseUser.phone_verified ?? Boolean(baseUser.phone),
    avatar_url: cleanOverrides.avatar_url !== undefined ? cleanOverrides.avatar_url : (baseUser.avatar_url || "/images/doctor-geneticist.jpg"),
    avatar_color: cleanOverrides.avatar_color || baseUser.avatar_color || "teal",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaceBrand, setWorkspaceBrand] = useState<WorkspaceBrandConfig>(DEFAULT_WORKSPACE_BRAND);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      const savedBrand = readJsonStorage<Partial<WorkspaceBrandConfig>>(WORKSPACE_BRAND_KEY, {});
      if (savedBrand && (savedBrand.name || savedBrand.logoKey)) {
        setWorkspaceBrand({ ...DEFAULT_WORKSPACE_BRAND, ...savedBrand });
      }

      const storedUser = typeof window !== "undefined" ? localStorage.getItem("medipredict_user") : null;
      const token = typeof window !== "undefined" ? localStorage.getItem("medipredict_token") : null;

      if (token && storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as User;
          setUser(mergeWithProfileOverrides(parsed));

          // Silently re-verify / hydrate with API
          const me = await api.getMe();
          const hydrated = mergeWithProfileOverrides(me);
          setUser(hydrated);
          writeJsonStorage("medipredict_user", hydrated);
        } catch {
          api.clearToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isPublic = PUBLIC_ROUTES.includes(pathname);
      if (!user && !isPublic) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [user, isLoading, pathname, router]);

  const persistUserState = useCallback((nextUser: User, persistOverrides = false) => {
    setUser(nextUser);
    writeJsonStorage("medipredict_user", nextUser);
    if (persistOverrides) {
      const overrideSlice: Partial<User> = {
        full_name: nextUser.full_name,
        role: nextUser.role,
        phone: nextUser.phone,
        phone_verified: nextUser.phone_verified,
        specialty: nextUser.specialty,
        organization: nextUser.organization,
        bio: nextUser.bio,
        avatar_url: nextUser.avatar_url,
        avatar_color: nextUser.avatar_color,
      };
      writeJsonStorage(PROFILE_OVERRIDES_KEY, overrideSlice);
    }
  }, []);

  const login = async (email: string, password: string, options?: AuthActionOptions): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      const hydrated = mergeWithProfileOverrides(res.user);
      persistUserState(hydrated);
      if (!options?.skipRedirect) {
        router.push(options?.redirectTo || "/dashboard");
      }
      return hydrated;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (
    phone: string,
    otp: string,
    meta?: PhoneLoginMeta
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.verifyPhoneOTP({
        phone,
        otp,
        full_name: meta?.full_name,
        role: meta?.role,
        specialty: meta?.specialty,
      });

      const customOverrides: Partial<User> = {
        phone,
        phone_verified: true,
      };
      if (meta?.full_name?.trim()) {
        customOverrides.full_name = meta.full_name.trim();
      }
      if (meta?.role) {
        customOverrides.role = meta.role;
      }
      if (meta?.specialty) {
        customOverrides.specialty = meta.specialty;
      }

      const existingOverrides = readJsonStorage<Partial<User>>(PROFILE_OVERRIDES_KEY, {});
      const nextOverrides = { ...existingOverrides, ...customOverrides };
      writeJsonStorage(PROFILE_OVERRIDES_KEY, nextOverrides);

      const finalUser = mergeWithProfileOverrides({
        ...res.user,
        ...customOverrides,
      });
      persistUserState(finalUser, true);

      if (!meta?.skipRedirect) {
        router.push(meta?.redirectTo || "/dashboard");
      }
      return finalUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    data: { email: string; password: string; full_name: string; phone?: string; role?: string },
    options?: AuthActionOptions
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const created = await api.register(data);
      const customOverrides: Partial<User> = {
        full_name: data.full_name,
        role: data.role || created.role || "clinician",
        phone: data.phone,
        phone_verified: Boolean(data.phone),
      };
      writeJsonStorage(PROFILE_OVERRIDES_KEY, customOverrides);

      const authRes = await api.login({ email: data.email, password: data.password });
      const finalUser = mergeWithProfileOverrides({
        ...authRes.user,
        email: data.email,
        full_name: data.full_name,
        role: data.role || authRes.user.role,
        phone: data.phone || authRes.user.phone,
        phone_verified: Boolean(data.phone || authRes.user.phone_verified),
      });
      persistUserState(finalUser, true);

      if (!options?.skipRedirect) {
        router.push(options?.redirectTo || "/dashboard");
      }
      return finalUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const me = await api.getMe();
      const hydrated = mergeWithProfileOverrides(me);
      persistUserState(hydrated);
    } catch {
      // Keep current session intact on transient offline network
    }
  };

  const switchRole = async (role: "clinician" | "patient" | "admin"): Promise<User> => {
    setIsLoading(true);
    try {
      const roleMap = {
        clinician: {
          email: "demo@medipredict.ai",
          name: "Dr. Elena Rostova",
          phone: "+1 (555) 019-2834",
          specialty: "Board-Certified Clinical Geneticist",
          avatar_url: "/images/doctor-geneticist.jpg",
          avatar_color: "teal",
        },
        patient: {
          email: "patient@medipredict.ai",
          name: "Alex Rivera",
          phone: "+1 (555) 019-8822",
          specialty: "Family Pedigree & Wellness Tracker",
          avatar_url: "/images/family-wellness.jpg",
          avatar_color: "emerald",
        },
        admin: {
          email: "admin@medipredict.ai",
          name: "Chief Genomic Admin",
          phone: "+1 (555) 019-1234",
          specialty: "Governance & Clinical Compliance Lead",
          avatar_url: "/images/clinical-research.jpg",
          avatar_color: "indigo",
        },
      }[role];

      let baseUser: User;
      try {
        const res = await api.login({ email: roleMap.email, password: "MedicalAI2026!" });
        baseUser = res.user;
      } catch {
        baseUser = {
          id: role === "admin" ? 3 : role === "patient" ? 2 : 1,
          email: roleMap.email,
          full_name: roleMap.name,
          role,
          is_active: true,
          is_verified: true,
          created_at: new Date().toISOString(),
        };
        api.setToken("demo_clinical_jwt_token_2026");
      }

      const nextUser: User = {
        ...baseUser,
        email: roleMap.email,
        full_name: roleMap.name,
        role,
        phone: roleMap.phone,
        phone_verified: true,
        specialty: roleMap.specialty,
        organization: "GeneWise Precision Genomics Institute",
        avatar_url: roleMap.avatar_url,
        avatar_color: roleMap.avatar_color,
      };
      persistUserState(nextUser, true);
      return nextUser;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdatePayload): Promise<User> => {
    const existingOverrides = readJsonStorage<Partial<User>>(PROFILE_OVERRIDES_KEY, {});
    const { password, ...safeProfileFields } = updates;

    let apiUser: User | null = null;
    try {
      apiUser = await api.updateMe(updates);
    } catch {
      apiUser = user;
    }

    const fallbackBase: User = apiUser ||
      user || {
        id: 1,
        email: "demo@medipredict.ai",
        full_name: "Dr. Elena Rostova",
        role: "clinician",
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
      };

    const nextOverrides = {
      ...existingOverrides,
      ...safeProfileFields,
    };
    writeJsonStorage(PROFILE_OVERRIDES_KEY, nextOverrides);

    const merged: User = {
      ...fallbackBase,
      ...nextOverrides,
    };

    if (
      updates.workspace_name !== undefined ||
      updates.workspace_subtitle !== undefined ||
      updates.workspace_badge !== undefined ||
      updates.workspace_logo_key !== undefined ||
      updates.workspace_logo_url !== undefined
    ) {
      updateWorkspaceBrand({
        ...(updates.workspace_name !== undefined ? { name: updates.workspace_name } : {}),
        ...(updates.workspace_subtitle !== undefined ? { subtitle: updates.workspace_subtitle } : {}),
        ...(updates.workspace_badge !== undefined ? { badge: updates.workspace_badge } : {}),
        ...(updates.workspace_logo_key !== undefined ? { logoKey: updates.workspace_logo_key } : {}),
        ...(updates.workspace_logo_url !== undefined ? { logoUrl: updates.workspace_logo_url } : {}),
      });
    }

    persistUserState(merged, true);
    return merged;
  };

  const verifyAndBindPhone = async (phone: string, otp: string): Promise<User> => {
    await api.verifyPhoneOTP({ phone, otp, full_name: user?.full_name, role: user?.role });
    return updateProfile({
      phone,
      phone_verified: true,
    });
  };

  const updateWorkspaceBrand = useCallback((partial: Partial<WorkspaceBrandConfig>): WorkspaceBrandConfig => {
    let resolved = DEFAULT_WORKSPACE_BRAND;
    setWorkspaceBrand((prev) => {
      resolved = {
        ...prev,
        ...partial,
        name: partial.name !== undefined ? partial.name.trim() || DEFAULT_WORKSPACE_BRAND.name : prev.name,
        subtitle: partial.subtitle !== undefined ? partial.subtitle.trim() || DEFAULT_WORKSPACE_BRAND.subtitle : prev.subtitle,
        badge: partial.badge !== undefined ? partial.badge.trim() || DEFAULT_WORKSPACE_BRAND.badge : prev.badge,
      };
      writeJsonStorage(WORKSPACE_BRAND_KEY, resolved);
      return resolved;
    });
    return resolved;
  }, []);

  const resetWorkspaceDefaults = useCallback(() => {
    setWorkspaceBrand(DEFAULT_WORKSPACE_BRAND);
    writeJsonStorage(WORKSPACE_BRAND_KEY, DEFAULT_WORKSPACE_BRAND);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaceBrand,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithPhone,
        register,
        logout,
        refreshUser,
        switchRole,
        updateProfile,
        verifyAndBindPhone,
        updateWorkspaceBrand,
        resetWorkspaceDefaults,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
