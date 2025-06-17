import React, { createContext, useContext, useEffect, useState } from "react";
import { router, useSegments } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  phone: string;
  username: string;
  photoStoragePath?: string;
  photoThumbnailPath?: string;
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
      photoStoragePath: string;
      photoThumbnailPath: string;
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
  const segments = useSegments();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
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
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inProfileGroup = segments[0] === "(profile)";

    if (!session && !inAuthGroup) {
      // Redirect to auth if not authenticated
      console.log("here 1");
      router.replace("/(auth)/welcome");
    } else if (session && !user && !inAuthGroup && !inProfileGroup) {
      // User is authenticated but profile not complete
      console.log("here 2");
      router.replace("/(profile)/create-profile");
    } else if (session && user && inAuthGroup) {
      // User is fully authenticated, redirect to main app
      console.log("here 3");
      router.replace("/(tabs)");
    }
  }, [session, user, loading, segments]);

  const fetchUserProfile = async (userId: string) => {
    try {
      // First get user data from Supabase
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile:", error);
        setLoading(false);
        return;
      }

      if (data) {
        // If user has photos, get the URLs from backend
        if (data.photoStoragePath && data.photoThumbnailPath) {
          try {
            const API_BASE_URL =
              process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);

            if (response.ok) {
              const userWithUrls = await response.json();
              setUser(userWithUrls);
            } else {
              setUser(data);
            }
          } catch (error) {
            console.error("Error fetching photo URLs:", error);
            setUser(data);
          }
        } else {
          setUser(data);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser.id);
    }
  };

  const signInWithOtp = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });
    return { error };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: "sms",
    });
    return { error };
  };

  const createUserProfile = async (
    username: string,
    photoData?: {
      photoStoragePath: string;
      photoThumbnailPath: string;
    }
  ) => {
    if (!supabaseUser) {
      return { error: "No authenticated user" };
    }

    const phone = supabaseUser.phone || "";

    // Prepare user data with optional photo fields
    const userData = {
      id: supabaseUser.id,
      phone: phone,
      username: username,
      ...(photoData && {
        photoStoragePath: photoData.photoStoragePath,
        photoThumbnailPath: photoData.photoThumbnailPath,
      }),
    };

    const { error } = await supabase.from("User").insert([userData]);

    if (!error) {
      // Refresh user profile
      await fetchUserProfile(supabaseUser.id);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        loading,
        signInWithOtp,
        verifyOtp,
        createUserProfile,
        refreshUserProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
