// contexts/UserProfileContext.tsx - Updated with API types
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "@/lib/supabase";
import { usersApi } from "@/services/api";
import { useAuth } from "./AuthContext";
import { useInvite } from "./InviteContext";
import { useRouter } from "expo-router";
import { imageCacheService } from "@/services/imageCacheService";
import log from "@/utils/logger";
import { User, UpdateUserRequest, UpdateUserResponse } from "@movapp/types";

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
  const { processPendingInvite } = useInvite();
  const router = useRouter();
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
              const userWithUrls = await usersApi.getUser(userId);

              if (userWithUrls) {
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
        const updateData: UpdateUserRequest = {
          username: data.username,
          phone: data.phone ?? undefined,
        };

        if (photoData) {
          updateData.profileImagePath = photoData.profileImagePath;
          updateData.profileThumbnailPath = photoData.profileThumbnailPath;
        }

        const response: UpdateUserResponse = await usersApi.updateUser(
          supabaseUser.id,
          updateData
        );

        if (response.success) {
          // Refresh profile to get updated data (which will also preload new images)
          await fetchUserProfile(supabaseUser.id);
          return { error: null };
        } else {
          throw new Error(response.message || "Failed to update profile");
        }
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

  // Process pending invite when user profile is loaded
  useEffect(() => {
    if (user && processPendingInvite) {
      processPendingInvite(user.id)
        .then((result) => {
          if (result.success && result.eventId) {
            // Add events tab to stack without showing it, then navigate to event
            router.push("/(app)/(tabs)/events");
            router.push(`/(app)/(event)/${result.eventId}`);
          } else {
          }
        })
        .catch((error) => {
          log.error("Error processing invite:", error);
        });
    } else {
    }
  }, [user, processPendingInvite]);

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
