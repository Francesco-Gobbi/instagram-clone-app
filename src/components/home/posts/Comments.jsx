import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useRef } from "react";
import BottomSheetComments from "../bottomSheets/BottomSheetComments";
import BottomSheetComment from "../bottomSheets/BottomSheetComment";
import { Image } from "expo-image";
import { COLORS } from "../../../utils/usePalete";

const Comments = ({ post, currentUser, navigation }) => {
  const bottomSheetRefComments = useRef(null);
  const bottomSheetRefComment = useRef(null);
  const handleViewComments = () => {
    if (bottomSheetRefComments.current) {
      bottomSheetRefComments.current.present();
    }
  };

  const handleViewComment = () => {
    if (Platform.OS === "ios") {
      if (bottomSheetRefComment.current) {
        bottomSheetRefComment.current.present();
      }
    } else if (bottomSheetRefComments.current) {
      bottomSheetRefComments.current.present();
    }
  };

  return (
    <View>
      {post.comments.length <= 0 ? (
        <TouchableOpacity onPress={handleViewComment} activeOpacity={0.7}>
          <View style={styles.container}>
            <Image
              source={{ uri: currentUser.profile_picture }}
              style={styles.image}
            />
            <Text style={styles.text}>Add a comment...</Text>
          </View>
        </TouchableOpacity>
      ) : post.comments.length > 1 ? (
        <TouchableOpacity onPress={handleViewComments} activeOpacity={0.7}>
          <View style={styles.container}>
            <Text style={styles.text}>
              View all {post.comments.length} comments
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleViewComments} activeOpacity={0.7}>
          <View style={styles.container}>
            <Text style={styles.text}>View 1 comment</Text>
          </View>
        </TouchableOpacity>
      )}

      <BottomSheetComments
        bottomSheetRef={bottomSheetRefComments}
        currentUser={currentUser}
        post={post}
        navigation={navigation}
      />
      <BottomSheetComment
        bottomSheetRef={bottomSheetRefComment}
        currentUser={currentUser}
        post={post}
      />
    </View>
  );
};

export default Comments;

const styles = StyleSheet.create({
  container: {
    marginTop: 9,
    marginHorizontal: 12,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "400",
  },
  image: {
    width: 26,
    height: 26,
    borderRadius: 100,
  },
});

