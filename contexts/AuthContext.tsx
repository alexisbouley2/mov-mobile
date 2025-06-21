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
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        return;
      }

      if (data) {
        if (data.profileImagePath && data.profileThumbnailPath) {
          try {
            const API_BASE_URL = config.EXPO_PUBLIC_API_URL;
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);

            if (response.ok) {
              const userWithUrls = await response.json();
              setUser(userWithUrls);
            } else {
              setUser(data);
            }
          } catch (error) {
            log.error("Error fetching user profile:", error);
            setUser(data);
          }
        } else {
          setUser(data);
        }
      }
    } catch (error) {
      log.error("Error fetching user profile:", error);
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser.id);
    }
  }, [supabaseUser, fetchUserProfile]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signInWithOtp = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });
    return { error };
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: "sms",
    });
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

      return { error };
    },
    [supabaseUser, fetchUserProfile]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
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
