// contexts/UserProfileContext.tsx - Updated with image caching
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import { useAuth } from "./AuthContext";
import { imageCacheService } from "@/services/imageCacheService";
import log from "@/utils/logger";

interface User {
  id: string;
  phone: string;
  username: string;
  profileImagePath?: string;
  profileThumbnailPath?: string;
  profileImageUrl?: string;
  profileThumbnailUrl?: string;
}

interface UserProfileContextType {
  user: User | null;
  profileLoading: boolean;
  profileError: string | null;
  createUserProfile: (
    _username: string,
    _photoData?: {
      profileImagePath?: string;
      profileThumbnailPath?: string;
    }
  ) => Promise<{ error: any }>;
  updateUserProfile: (
    _data: Partial<User>,
    _photoData?: {
      profileImagePath?: string;
      profileThumbnailPath?: string;
    }
  ) => Promise<{ error: any }>;
  clearProfileError: () => void;
}

const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  profileLoading: false,
  profileError: null,
  createUserProfile: async () => ({ error: null }),
  updateUserProfile: async () => ({ error: null }),
  clearProfileError: () => {},
});

export const useUserProfile = () => useContext(UserProfileContext);

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabaseUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const preloadProfileImages = useCallback(async (userData: User) => {
    const imagesToPreload: Array<{
      url: string;
      policy: "profile-image" | "profile-thumbnail";
    }> = [];

    // Preload profile thumbnail (used in most UI components)
    if (userData.profileThumbnailUrl) {
      imagesToPreload.push({
        url: userData.profileThumbnailUrl,
        policy: "profile-thumbnail",
      });
    }

    // Preload full profile image (used in profile view)
    if (userData.profileImageUrl) {
      imagesToPreload.push({
        url: userData.profileImageUrl,
        policy: "profile-image",
      });
    }

    if (imagesToPreload.length > 0) {
      log.info(`Preloading ${imagesToPreload.length} profile images`);
      await Promise.all(
        imagesToPreload.map(({ url, policy }) =>
          imageCacheService.cache(url, policy)
        )
      );
    }
  }, []);

  const fetchUserProfile = useCallback(
    async (userId: string) => {
      try {
        setProfileLoading(true);
        setProfileError(null);

        // First, get basic profile data from Supabase
        const { data, error } = await supabase
          .from("User")
          .select("*")
          .eq("id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          throw new Error(error.message);
        }

        if (data) {
          // If user has profile images, fetch URLs from API
          if (data.profileImagePath && data.profileThumbnailPath) {
            try {
              const API_BASE_URL = config.EXPO_PUBLIC_API_URL;
              const response = await fetch(`${API_BASE_URL}/users/${userId}`);

              if (response.ok) {
                const userWithUrls = await response.json();
                setUser(userWithUrls);

                // Preload profile images in background
                await preloadProfileImages(userWithUrls);
              } else {
                // Fallback to basic data if API fails
                setUser(data);
              }
            } catch (apiError) {
              log.error("Error fetching user profile URLs:", apiError);
              // Fallback to basic data if API fails
              setUser(data);
            }
          } else {
            setUser(data);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch user profile";
        log.error("Error fetching user profile:", error);
        setProfileError(errorMessage);
      } finally {
        setProfileLoading(false);
      }
    },
    [preloadProfileImages]
  );

  const createUserProfile = useCallback(
    async (
      username: string,
      photoData?: {
        profileImagePath?: string;
        profileThumbnailPath?: string;
      }
    ) => {
      if (!supabaseUser) {
        return { error: "No authenticated user" };
      }

      try {
        setProfileLoading(true);
        setProfileError(null);

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

        if (error) {
          throw new Error(error.message);
        }

        // Fetch the newly created profile (which will also preload images)
        await fetchUserProfile(supabaseUser.id);
        return { error: null };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create user profile";
        setProfileError(errorMessage);
        return { error: errorMessage };
      } finally {
        setProfileLoading(false);
      }
    },
    [supabaseUser, fetchUserProfile]
  );

  const updateUserProfile = useCallback(
    async (
      data: Partial<User>,
      photoData?: {
        profileImagePath?: string;
        profileThumbnailPath?: string;
      }
    ) => {
      if (!supabaseUser) {
        return { error: "No authenticated user" };
      }

      try {
        setProfileLoading(true);
        setProfileError(null);

        // Use API for updates to handle image URLs properly
        const API_BASE_URL = config.EXPO_PUBLIC_API_URL;
        const updateData: any = { ...data };

        if (photoData) {
          updateData.profileImagePath = photoData.profileImagePath;
          updateData.profileThumbnailPath = photoData.profileThumbnailPath;
        }

        const response = await fetch(
          `${API_BASE_URL}/users/${supabaseUser.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to update profile: ${response.status} - ${errorText}`
          );
        }
        // Refresh profile to get updated data (which will also preload new images)
        await fetchUserProfile(supabaseUser.id);
        return { error: null };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update user profile";
        setProfileError(errorMessage);
        return { error: errorMessage };
      } finally {
        setProfileLoading(false);
      }
    },
    [supabaseUser, fetchUserProfile]
  );

  const clearProfileError = useCallback(() => {
    setProfileError(null);
  }, []);

  // Fetch profile when user logs in
  useEffect(() => {
    if (isAuthenticated && supabaseUser) {
      fetchUserProfile(supabaseUser.id);
    } else if (!isAuthenticated) {
      // Clear profile data when user logs out
      setUser(null);
      setProfileError(null);
    }
  }, [isAuthenticated, supabaseUser, fetchUserProfile]);

  const contextValue = useMemo(
    () => ({
      user,
      profileLoading,
      profileError,
      createUserProfile,
      updateUserProfile,
      clearProfileError,
    }),
    [
      user,
      profileLoading,
      profileError,
      createUserProfile,
      updateUserProfile,
      clearProfileError,
    ]
  );

  return (
    <UserProfileContext.Provider value={contextValue}>
      {children}
    </UserProfileContext.Provider>
  );
}
