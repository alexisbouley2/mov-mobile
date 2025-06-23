import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");
const GRID_PADDING = 15;
const ITEM_SPACING = 10;
const ITEM_SIZE = (width - GRID_PADDING * 2 - ITEM_SPACING * 2) / 3;

interface VideoGridItemProps {
  item: {
    id: string;
    thumbnailUrl: string;
    user: {
      username: string;
      photo?: string;
    };
  };
  index: number;
  onPress: (_index: number) => void;
}

export default function VideoGridItem({
  item,
  index,
  onPress,
}: VideoGridItemProps) {
  const isLeftColumn = index % 3 === 0;
  const isRightColumn = index % 3 === 2;

  return (
    <TouchableOpacity
      style={[
        styles.videoItem,
        !isLeftColumn && !isRightColumn && styles.videoItemCenter,
      ]}
      onPress={() => onPress(index)}
      activeOpacity={0.8}
    >
      <View style={styles.videoContainer}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          transition={200}
        />

        <View style={styles.playIndicator}>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Image
          source={{
            uri:
              item.user.photo || "https://via.placeholder.com/24/666/666.png",
          }}
          style={styles.userAvatar}
          contentFit="cover"
        />
        <Text style={styles.username} numberOfLines={1}>
          {item.user.username}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  videoItem: {
    width: ITEM_SIZE,
    marginBottom: 15,
  },
  videoItemCenter: {
    marginHorizontal: ITEM_SPACING / 2,
  },
  videoContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#111",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 12,
    color: "#000",
    marginLeft: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  userAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  username: {
    flex: 1,
    fontSize: 12,
    color: "#ccc",
  },
});
