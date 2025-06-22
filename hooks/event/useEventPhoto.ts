import { usePhotoUpload } from "@/hooks/usePhotoUpload";

interface UseEventPhotoProps {
  initialImageUrl?: string | null;
  onImageChange?: (_imageUri: string | null) => void;
}

export function useEventPhoto({
  initialImageUrl,
  onImageChange,
}: UseEventPhotoProps = {}) {
  return usePhotoUpload({
    initialImageUrl,
    onImageChange,
    uploadType: "event_photo",
    aspectRatio: [16, 9], // 16:9 aspect ratio for event photos
    photoDataKey: {
      imagePath: "coverImagePath",
      thumbnailPath: "coverThumbnailPath",
    },
  });
}
