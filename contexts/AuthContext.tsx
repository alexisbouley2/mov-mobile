import React, { createContext, useContext, useEffect, useState } from "react";
import { router, useSegments } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  phone: string;
  username: string;
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signInWithOtp: (_phone: string) => Promise<{ error: any }>;
  verifyOtp: (_phone: string, _token: string) => Promise<{ error: any }>;
  createUserProfile: (_username: string) => Promise<{ error: any }>;
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

    if (!session && !inAuthGroup) {
      // Redirect to auth if not authenticated
      router.replace("/(auth)/welcome");
    } else if (session && !user && !inAuthGroup) {
      // User is authenticated but profile not complete
      router.replace("/(auth)/create-profile");
    } else if (session && user && inAuthGroup) {
      // User is fully authenticated, redirect to main app
      router.replace("/(tabs)");
    }
  }, [session, user, loading, segments]);

  const fetchUserProfile = async (userId: string) => {
    try {
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
        setUser(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      setLoading(false);
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

  const createUserProfile = async (username: string) => {
    if (!supabaseUser) {
      return { error: "No authenticated user" };
    }

    const phone = supabaseUser.phone || "";

    const { error } = await supabase.from("User").insert([
      {
        id: supabaseUser.id,
        phone: phone,
        username: username,
      },
    ]);

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
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
