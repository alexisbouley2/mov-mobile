// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/lib/supabase";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { config } from "@/lib/config";
import log from "@/utils/logger";

interface User {
  id: string;
  phone: string;
  username: string;
  profileImagePath?: string;
  profileThumbnailPath?: string;
  photoUrl?: string;
  photoThumbnailUrl?: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signInWithOtp: (_phone: string) => Promise<{ error: any }>;
  verifyOtp: (_phone: string, _token: string) => Promise<{ error: any }>;
  createUserProfile: (
    _username: string,
    _photoData?: {
      profileImagePath: string;
      profileThumbnailPath: string;
    }
  ) => Promise<{ error: any }>;
  refreshUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  loading: true,
  signInWithOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  createUserProfile: async () => ({ error: null }),
  refreshUserProfile: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    log.debug("🔍 AuthContext - fetchUserProfile called for:", userId);
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        log.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        log.debug("📊 AuthContext - User data fetched:", data.username);

        if (data.profileImagePath && data.profileThumbnailPath) {
          try {
            const API_BASE_URL = config.EXPO_PUBLIC_API_URL;
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);

            if (response.ok) {
              const userWithUrls = await response.json();
              log.debug("📸 AuthContext - User with photo URLs set");
              setUser(userWithUrls);
            } else {
              log.debug("📊 AuthContext - User without photo URLs set");
              setUser(data);
            }
          } catch (error) {
            log.error("Error fetching photo URLs:", error);
            setUser(data);
          }
        } else {
          log.debug("📊 AuthContext - User without photos set");
          setUser(data);
        }
      }
    } catch (error) {
      log.error("Error in fetchUserProfile:", error);
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    log.debug("🔄 AuthContext - refreshUserProfile called");
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser.id);
    }
  }, [supabaseUser, fetchUserProfile]);

  useEffect(() => {
    log.debug("🚀 AuthContext - Initial setup starting");

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      log.debug("🎯 AuthContext - Initial session:", !!session);
      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      log.debug("🔔 AuthContext - Auth state change:", event, !!session);
      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      log.debug("🧹 AuthContext - Cleanup auth listener");
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signInWithOtp = useCallback(async (phone: string) => {
    log.debug("📱 AuthContext - signInWithOtp called for:", phone);
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });
    log.debug(
      "📱 AuthContext - signInWithOtp result:",
      !!error ? "error" : "success"
    );
    return { error };
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    log.debug("🔐 AuthContext - verifyOtp called for:", phone);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: "sms",
    });
    log.debug(
      "🔐 AuthContext - verifyOtp result:",
      !!error ? "error" : "success"
    );
    return { error };
  }, []);

  const createUserProfile = useCallback(
    async (
      username: string,
      photoData?: {
        profileImagePath: string;
        profileThumbnailPath: string;
      }
    ) => {
      log.debug("👤 AuthContext - createUserProfile called for:", username);
      if (!supabaseUser) {
        return { error: "No authenticated user" };
      }

      const phone = supabaseUser.phone || "";

      const userData = {
        id: supabaseUser.id,
        phone: phone,
        username: username,
        ...(photoData && {
          profileImagePath: photoData.profileImagePath,
          profileThumbnailPath: photoData.profileThumbnailPath,
        }),
      };

      const { error } = await supabase.from("User").insert([userData]);

      if (!error) {
        await fetchUserProfile(supabaseUser.id);
      }

      log.debug(
        "👤 AuthContext - createUserProfile result:",
        !!error ? "error" : "success"
      );
      return { error };
    },
    [supabaseUser, fetchUserProfile]
  );

  const signOut = useCallback(async () => {
    log.debug("🚪 AuthContext - signOut called");
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    log.debug("🚪 AuthContext - signOut completed");
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      supabaseUser,
      session,
      loading,
      signInWithOtp,
      verifyOtp,
      createUserProfile,
      refreshUserProfile,
      signOut,
    }),
    [
      user,
      supabaseUser,
      session,
      loading,
      signInWithOtp,
      verifyOtp,
      createUserProfile,
      refreshUserProfile,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
