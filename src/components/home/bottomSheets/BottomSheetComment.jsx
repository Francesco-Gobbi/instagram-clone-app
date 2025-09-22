
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useMemo } from "react";
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { SIZES } from "../../../constants";
import { Image } from "expo-image";
import useUploadComment from "../../../hooks/useUploadComment";
import TransparentBackdrop from "../../shared/bottomSheets/TransparentBackdrop";

const BottomSheetComment = ({ bottomSheetRef, currentUser, post }) => {
  const [value, setValue] = useState("");
  const { uploadComment, isLoading } = useUploadComment(post, currentUser);

  // Utilizzare snapPoints fissi invece di dinamici per evitare problemi
  const snapPoints = useMemo(() => ["25%"], []);

  const handleSubmitComment = async (value) => {
    await uploadComment(value);
    setValue("");
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{
        borderRadius: 0,
        backgroundColor: "#000",
        borderTopColor: "#555",
        borderTopWidth: 0.5,
        marginTop: 3,
      }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={TransparentBackdrop}
      handleComponent={() => <View></View>}
    >
      <View style={styles.mainContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={() => setValue(value + "❤️")}
              activeOpacity={0.7}
            >
              <Text style={styles.chatIcon}>❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setValue(value + "🙌")}
              activeOpacity={0.7}
            >
              <Text style={styles.chatIcon}>🙌</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setValue(value + "🔥")}
              activeOpacity={0.7}
            >
              <Text style={styles.chatIcon}>🔥</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setValue(value + "👏")}
              activeOpacity={0.7}
            >
              <Text style={styles.chatIcon}>👏</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setValue(value + "😢")}
              activeOpacity={0.7}
            >
              <Text style={styles.chatIcon}>😢</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setValue(value + "😍")}
              activeOpacity={0.7}
            >
              <Text style={styles.chatIcon}>😍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setValue(value + "😮")}
              activeOpacity={0.7}
            >
              <Text style={styles.chatIcon}>😮</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setValue(value + "😂")}
              activeOpacity={0.7}
            >
              <Text style={styles.chatIcon}>😂</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.writingContainer}>
            <Image
              source={{ uri: currentUser.profile_picture }}
              style={styles.profilePicture}
            />
            <View style={styles.inputWrapper}>
              <BottomSheetTextInput
                placeholder="Add a comment..."
                placeholderTextColor="#858585"
                style={styles.textInput}
                value={value} // Cambiare da defaultValue a value
                onChangeText={(text) => setValue(text)}
                autoCapitalize="sentences"
                autoCorrect={true}
                maxLength={255}
                multiline
                autoFocus
              />
              {!isLoading ? (
                <TouchableOpacity
                  onPress={() => value !== "" && handleSubmitComment(value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.postBtn}>{value !== "" ? "Post" : ""}</Text>
                </TouchableOpacity>
              ) : (
                <ActivityIndicator style={styles.activityIndicator} />
              )}
            </View>
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
};


export default BottomSheetComment;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 15,
  },
  divider: {
    paddingTop: 1,
    width: "100%",
    backgroundColor: "#444",
  },
  commentsContainer: {
    maxHeight: SIZES.Height * 0.7,
  },
  noCommentsContainer: {
    alignItems: "center",
  },
  subTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 15,
  },
  comments: {
    fontSize: 15,
    fontWeight: "300",
    color: "#fff",
    marginVertical: 15,
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 35,
  },
  iconContainer: {
    marginVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatIcon: {
    fontSize: 29,
  },
  writingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  profilePicture: {
    height: 43,
    width: 43,
    borderRadius: 100,
  },
  inputWrapper: {
    width: 295,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#777",
    justifyContent: "center",
    paddingLeft: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingVertical: 5,
  },
  textInput: {
    fontSize: 16,
    flex: 1,
    fontWeight: "400",
    color: "#fff",
    maxWidth: "78%",
    marginBottom: 5,
  },
  postBtn: {
    color: "#09f",
    fontSize: 18,
    fontWeight: "700",
    paddingRight: 12,
  },
  activityIndicator: {
    marginRight: 20,
  },
});
