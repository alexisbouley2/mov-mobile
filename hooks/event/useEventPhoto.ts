import { usePhotoUpload } from "@/hooks/upload/usePhotoUpload";

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
    aspectRatio: [1, 1],
    photoDataKey: {
      imagePath: "coverImagePath",
      thumbnailPath: "coverThumbnailPath",
    },
  });
}
