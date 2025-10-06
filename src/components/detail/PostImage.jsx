import { StyleSheet, View } from "react-native";
import React from "react";
import Animated from "react-native-reanimated";
import { SIZES } from "../../constants/";
import { Image } from "expo-image";
import { GestureDetector } from "react-native-gesture-handler";
import useLikeAnimation from "../../utils/useLikeAnimation";
import { Fontisto } from "@expo/vector-icons";

const PostImage = ({ post, currentUser }) => {
  const { handleDoubleTap, animatedStyles } = useLikeAnimation(
    post,
    currentUser,
    { iconSize: 78 }
  );

  return (
    <GestureDetector gesture={handleDoubleTap}>
      <View>
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
        <Animated.View style={[styles.likeContainer, animatedStyles]}>
          <Fontisto name="like" size={78} color="#f21818ff" />
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

export default PostImage;

const styles = StyleSheet.create({
  postImage: {
    marginTop: 7,
    marginBottom: 11,
    height: SIZES.Width * 1.1,
    width: SIZES.Width,
    contentFit: "cover",
  },
  likeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    opacity: 0,
    pointerEvents: "none",
  },
});
