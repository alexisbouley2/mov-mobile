// components/ui/CachedImage.tsx - Reusable cached image component
import React, { useState, useEffect } from "react";
import { Image, ImageProps, ActivityIndicator, View } from "react-native";
import {
  imageCacheService,
  type CachePolicy,
} from "@/services/imageCacheService";
import log from "@/utils/logger";

interface CachedImageProps extends Omit<ImageProps, "source"> {
  uri: string;
  cachePolicy?: CachePolicy;
  fallbackSource?: ImageProps["source"];
  showLoading?: boolean;
  loadingSize?: "small" | "large";
  loadingColor?: string;
}

export function CachedImage({
  uri,
  cachePolicy = "profile-thumbnail",
  fallbackSource,
  showLoading = true,
  loadingSize = "small",
  loadingColor = "#666",
  style,
  ...imageProps
}: CachedImageProps) {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);

        // First check if image is already cached
        const cachedPath = await imageCacheService.getCached(uri);

        if (cachedPath && isMounted) {
          setImageSource(cachedPath);
          setLoading(false);
          return;
        }

        // If not cached, try to cache it
        const newCachedPath = await imageCacheService.cache(uri, cachePolicy);

        if (newCachedPath && isMounted) {
          setImageSource(newCachedPath);
        } else if (isMounted) {
          // If caching fails, fall back to original URI
          setImageSource(uri);
        }
      } catch (err) {
        log.error("Failed to load cached image:", err);
        if (isMounted) {
          setError(true);
          // Fallback to original URI
          setImageSource(uri);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (uri) {
      loadImage();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [uri, cachePolicy]);

  const handleImageError = () => {
    setError(true);
    if (fallbackSource) {
      // Use fallback if provided
      setImageSource(null);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  // Show loading indicator
  if (loading && showLoading) {
    return (
      <View style={[style, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size={loadingSize} color={loadingColor} />
      </View>
    );
  }

  // Show fallback if error and fallback is provided
  if (error && fallbackSource) {
    return (
      <Image
        {...imageProps}
        source={fallbackSource}
        style={style}
        onLoad={handleImageLoad}
      />
    );
  }

  // Show cached image or original URI
  if (imageSource) {
    return (
      <Image
        {...imageProps}
        source={{ uri: imageSource }}
        style={style}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    );
  }

  // Return empty view if no source
  return <View style={style} />;
}
