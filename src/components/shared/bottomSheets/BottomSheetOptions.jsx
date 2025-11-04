import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import React, { useMemo } from "react";
import { Ionicons, Feather, MaterialIcons, Octicons } from "@expo/vector-icons";
import BottomSheet from "../../shared/bottomSheets/BottomSheet";
import useReportAction from "../../../hooks/useReportAction";
import useDeletePost from "../../../hooks/useDeletePost";
import useSharePost from "../../../hooks/useSharePost";
import useSavePost from "../../../hooks/useSavePost";

const BottomSheetOptions = ({
  bottomSheetRef,
  navigation,
  post,
  currentUser,
}) => {
  const { handleReportPost, ReportModalComponent } = useReportAction();
  const { deletePost } = useDeletePost();
  const { sharePost } = useSharePost();
  const { savePost } = useSavePost();

  const snapPoints = useMemo(() => ["50%"], []);

  const handleSavePost = async () => {
    await savePost(post, currentUser);
    bottomSheetRef.current?.dismiss();
  };

  const handleSharePost = async () => {
    bottomSheetRef.current?.dismiss();
    await sharePost(post);
  };

  const handleEditPost = () => {
    bottomSheetRef.current?.dismiss();
    navigation.navigate("EditPost", { post });
  };

  const handleDeletePost = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            bottomSheetRef.current?.dismiss();
            deletePost(post);
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleAboutAccount = () => {
    bottomSheetRef.current?.dismiss();
    if (currentUser.email === post.owner_email) {
      navigation.navigate("Main Screen", { screen: "Account" });
    } else {
      navigation.navigate("UserDetail", { email: post.owner_email });
    }
  };

  return (
    <>
      <ReportModalComponent />
      <BottomSheet
        bottomSheetRef={bottomSheetRef}
        snapPoints={snapPoints}
        onDismiss={() => {}}
      >
        <View style={styles.container}>
          <View style={styles.topContainer}>
            <TouchableOpacity
              onPress={handleSavePost}
              style={styles.opacityContainer}
            >
              <View style={styles.buttonContainer}>
                {currentUser.saved_posts?.includes(post.id) ? (
                  <Ionicons name="bookmark" size={24} color="#fff" />
                ) : (
                  <Feather name="bookmark" size={24} color="#fff" />
                )}
                <Text style={styles.buttonText}>Save</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSharePost}
              style={styles.opacityContainer}
            >
              <View style={styles.buttonContainer}>
                <Feather name="send" size={24} color="#fff" />
                <Text style={styles.buttonText}>Share</Text>
              </View>
            </TouchableOpacity>
          </View>

          {post.owner_email === currentUser.email ? (
            <View style={styles.verticalGroup}>
              <TouchableOpacity
                onPress={handleEditPost}
                style={styles.columnContainer}
              >
                <View style={styles.optionContainer}>
                  <MaterialIcons name="edit" size={24} color="#fff" />
                  <Text style={styles.optionText}>Edit</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                onPress={handleDeletePost}
                style={styles.columnContainer}
              >
                <View style={styles.optionContainer}>
                  <Ionicons name="trash-outline" size={24} color="#f00" />
                  <Text style={styles.optionRedText}>Delete</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.verticalGroup}>
              <TouchableOpacity
                onPress={handleAboutAccount}
                style={styles.columnContainer}
              >
                <View style={styles.optionContainer}>
                  <Ionicons
                    name="information-circle-outline"
                    size={26}
                    color="#fff"
                  />
                  <Text style={styles.optionText}>About this account</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current?.dismiss();
                  handleReportPost(post, currentUser);
                }}
                style={styles.columnContainer}
              >
                <View style={styles.optionContainer}>
                  <Octicons name="report" size={22} color="#f00" />
                  <Text style={styles.optionRedText}>Report</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    marginBottom: 15,
  },
  opacityContainer: {
    flexDirection: "row",
    flex: 1,
  },
  buttonContainer: {
    backgroundColor: "#444",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 14,
    marginTop: 4,
  },
  verticalGroup: {
    borderRadius: 15,
    overflow: "hidden",
  },
  columnContainer: {
    flexDirection: "row",
  },
  optionContainer: {
    backgroundColor: "#444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 58,
    flex: 1,
    gap: 12,
  },
  optionText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  optionRedText: {
    color: "#f00",
    fontWeight: "500",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
  },
});

export default BottomSheetOptions;