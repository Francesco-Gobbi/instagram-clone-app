import { StyleSheet, View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Feather, Ionicons, AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import useSharePost from "../../hooks/useSharePost";
import useSavePost from "../../hooks/useSavePost";
import useHandleLike from "../../hooks/useHandleLike";
import BottomSheetComments from "./bottomSheets/BottomSheetComments";

const Footer = ({
  post,
  currentUser,
  bottomSheetRef,
  setBottomSheetIndex,
  sharedIndex,
  navigation
}) => {
  const { handlePostLike } = useHandleLike();
  const { sharePost } = useSharePost();
  const { savePost } = useSavePost();

  const handleCommentsSection = () => {
    setBottomSheetIndex(sharedIndex);
    bottomSheetRef.current?.present?.();
  };

  const handleSharePost = () => {
    sharePost(post);
  };

  const handleSavePost = () => {
    savePost(post, currentUser);
  };

  const handleViewComments = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.present({ focus: false });
    }
  };


  return (
    <View style={styles.footerIconsContainer}>
      <View style={styles.footerIcons}>
        <TouchableOpacity
          onPress={() => handlePostLike(post, currentUser)}
          activeOpacity={0.7}
        >
          {post.likes_by_users.includes(currentUser.email) ? (
            <AntDesign name="like" size={26} color="#ff3b30" style={styles.icon} />
          ) : (
            <AntDesign name="like" size={26} color="#fff" style={styles.icon} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleViewComments} activeOpacity={0.7}>
          <Ionicons name="chatbubble-ellipses-outline" size={25} color="#fff" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => sharePost(post)} activeOpacity={0.7}>
          <FontAwesome name="send-o" size={24} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => savePost(post, currentUser)} activeOpacity={0.7}>
        {currentUser.saved_posts && currentUser.saved_posts.includes(post.id) ? (
          <Feather name="bookmark" size={24} color="#fff" style={styles.icon} />
        ) : (
          <MaterialIcons name="bookmark-added" size={27} color="#fff" style={styles.icon} />
        )}
      </TouchableOpacity>
      <BottomSheetComments
        bottomSheetRef={bottomSheetRef}
        currentUser={currentUser}
        post={post}
        navigation={navigation}
      />
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footerIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 12,
  },
  footerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  icon: {
    transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
  },
  headerIcons: {
    marginRight: 15,
  },
});
