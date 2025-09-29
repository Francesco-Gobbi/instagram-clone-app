import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useImperativeHandle, useRef, useState } from "react";
import FooterTextInput from "../../shared/bottomSheets/FooterTextInput";

const BottomSheetComment = ({ bottomSheetRef, currentUser, post }) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => Keyboard.dismiss(), 0);
  }, []);

  useImperativeHandle(
    bottomSheetRef,
    () => ({
      present: () => {
        setIsVisible(true);
        setTimeout(() => {
          inputRef.current?.focus?.();
        }, Platform.OS === "android" ? 160 : 60);
      },
      dismiss: close,
      close,
      isVisible: () => isVisible,
    }),
    [close, isVisible]
  );

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          style={styles.wrapper}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Add a comment</Text>
            <FooterTextInput
              ref={inputRef}
              post={post}
              currentUser={currentUser}
              autoFocus
              allowBlurOnSubmit
              onSubmitted={close}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default BottomSheetComment;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  wrapper: {
    width: "100%",
  },
  card: {
    backgroundColor: "#232325",
    paddingBottom: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 12,
  },
});
