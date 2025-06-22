import { usePhotoUpload } from "@/hooks/usePhotoUpload";

interface UseProfilePhotoProps {
  initialImageUrl?: string | null;
  onImageChange?: (_imageUri: string | null) => void;
}

export function useProfilePhoto({
  initialImageUrl,
  onImageChange,
}: UseProfilePhotoProps = {}) {
  return usePhotoUpload({
    initialImageUrl,
    onImageChange,
    uploadType: "user_photo",
    aspectRatio: [1, 1], // Square aspect ratio for profile photos
    photoDataKey: {
      imagePath: "profileImagePath",
      thumbnailPath: "profileThumbnailPath",
    },
  });
}
