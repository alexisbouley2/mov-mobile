import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { CachedImage } from "@/components/ui/CachedImage";
import { User } from "@movapp/types";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 3;

interface VideoGridItemProps {
  item: {
    id: string;
    thumbnailUrl: string;
    user: User;
  };
  index: number;
  onPress: (_index: number) => void;
}

export default function VideoGridItem({
  item,
  index,
  onPress,
}: VideoGridItemProps) {
  return (
    <TouchableOpacity onPress={() => onPress(index)} activeOpacity={0.8}>
      <View style={styles.videoContainer}>
        <CachedImage
          uri={item.thumbnailUrl}
          cachePolicy="video-thumbnail"
          style={styles.thumbnail}
          fallbackSource={undefined}
          showLoading={true}
          loadingColor="#666"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: ITEM_WIDTH,
    height: (ITEM_WIDTH * 16) / 9,
    borderWidth: 1,
    borderColor: "#000",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
});
