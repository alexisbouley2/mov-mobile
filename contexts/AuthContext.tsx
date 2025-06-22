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
import log from "@/utils/logger";

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  signInWithOtp: (_phone: string) => Promise<{ error: any }>;
  verifyOtp: (_phone: string, _token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  supabaseUser: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  signInWithOtp: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      log.info("Auth state changed:", event);
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // State will be automatically updated by onAuthStateChange
  }, []);

  const isAuthenticated = useMemo(() => !!supabaseUser, [supabaseUser]);

  const contextValue = useMemo(
    () => ({
      supabaseUser,
      session,
      isAuthenticated,
      loading,
      signInWithOtp,
      verifyOtp,
      signOut,
    }),
    [
      supabaseUser,
      session,
      isAuthenticated,
      loading,
      signInWithOtp,
      verifyOtp,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
