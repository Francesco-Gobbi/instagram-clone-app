import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  FlatList,
  Pressable,
} from "react-native";
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Comments from "./Comments";
import { SIZES } from "../../../constants";
import FooterTextInput from "../../shared/bottomSheets/FooterTextInput";

const BottomSheetComments = ({
  bottomSheetRef,
  currentUser,
  post,
  navigation,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useImperativeHandle(
    bottomSheetRef,
    () => ({
      present: () => {
        setIsVisible(true);
        setFocusSignal((prev) => prev + 1);
      },
      dismiss: () => setIsVisible(false),
      close: () => setIsVisible(false),
      isVisible: () => isVisible,
    }),
    [isVisible]
  );

  useEffect(() => {
    if (Platform.OS === "android") {
      const showSub = Keyboard.addListener("keyboardDidShow", () => {
        setIsKeyboardVisible(true);
      });
      const hideSub = Keyboard.addListener("keyboardDidHide", () => {
        setIsKeyboardVisible(false);
      });
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }
  }, []);

  const close = () => {
    setIsVisible(false);
    Keyboard.dismiss();
  };

  const sheetMaxHeight = useMemo(() => SIZES.Height * 0.9, []);
  const sheetMinHeight = useMemo(
    () => (isKeyboardVisible ? SIZES.Height * 0.45 : SIZES.Height * 0.6),
    [isKeyboardVisible]
  );

  if (!isVisible) {
    return null;
  }

  return (
    <Modal transparent visible animationType="slide" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
          style={styles.avoider}
        >
          <View
            style={[
              styles.sheet,
              { maxHeight: sheetMaxHeight, minHeight: sheetMinHeight },
            ]}
          >
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>
            <View style={styles.header}>
              <Text style={styles.title}>Comments</Text>
              <TouchableOpacity
                onPress={close}
                hitSlop={{ top: 12, left: 12, bottom: 12, right: 12 }}
              >
                <Text style={styles.closeLabel}>Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.listWrapper}>
                {post.comments.length > 0 ? (
                  <FlatList
                    data={post.comments}
                    inverted
                    keyExtractor={(_, index) => String(index)}
                    renderItem={({ item, index }) => (
                      <Comments
                        comment={item}
                        index={index}
                        postId={post.id}
                        userId={post.owner_email}
                        currentUser={currentUser}
                        comments={post.comments}
                        navigation={navigation}
                        bottomSheetRef={bottomSheetRef}
                      />
                    )}
                    contentContainerStyle={styles.flatListContent}
                    style={styles.flatList}
                  />
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No comments yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Start the conversation.
                    </Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
            <FooterTextInput
              post={post}
              currentUser={currentUser}
              focusSignal={focusSignal}
              onSubmitted={() => setFocusSignal((prev) => prev + 1)}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default BottomSheetComments;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  avoider: {
    width: "100%",
  },
  sheet: {
    width: "100%",
    backgroundColor: "#232325",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 8,
    overflow: "hidden",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 10,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
  },
  closeLabel: {
    color: "#0af",
    fontWeight: "600",
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#37373a",
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "#888",
    fontSize: 15,
  },
});
