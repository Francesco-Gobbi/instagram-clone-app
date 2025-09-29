import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Image } from "expo-image";
import useUploadComment from "../../../hooks/useUploadComment";

const QUICK_REACTIONS = [
  "\u2764\uFE0F",
  "\uD83D\uDE4C",
  "\uD83D\uDD25",
  "\uD83D\uDC4F",
  "\uD83D\uDE22",
  "\uD83D\uDE0D",
  "\uD83D\uDE2E",
  "\uD83D\uDE02",
];

const FooterTextInput = forwardRef(
  (
    {
      post,
      currentUser,
      autoFocus = false,
      focusSignal = 0,
      onSubmitted,
      allowBlurOnSubmit = false,
    },
    ref
  ) => {
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const { uploadComment, isLoading } = useUploadComment(post, currentUser);
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => setValue(""),
      setValue,
      getValue: () => value,
    }));

    useEffect(() => {
      if (autoFocus || focusSignal) {
        const focus = () => inputRef.current?.focus();
        const timeout = setTimeout(focus, Platform.OS === "android" ? 120 : 0);
        return () => clearTimeout(timeout);
      }
      return undefined;
    }, [autoFocus, focusSignal]);

    const handleSubmitComment = async () => {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        return;
      }

      await uploadComment(trimmedValue);
      setValue("");
      onSubmitted?.();
      if (!allowBlurOnSubmit) {
        inputRef.current?.focus();
      } else {
        inputRef.current?.blur();
      }
    };

    const inputWrapperStyles = [
      styles.inputWrapper,
      isFocused ? styles.inputWrapperFocused : null,
    ];

    const canPost = value.trim().length > 0;

    const appendEmoji = (emoji) => {
      setValue((prev) => prev + emoji);
    };

    return (
      <View style={styles.inputContainer}>
        <View style={styles.divider} />
        <View style={styles.iconContainer}>
          {QUICK_REACTIONS.map((emoji) => (
            <TouchableOpacity key={emoji} onPress={() => appendEmoji(emoji)}>
              <Text style={styles.chatIcon}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.writingContainer}>
          <Image
            source={{
              uri: currentUser.profile_picture,
            }}
            style={styles.profilePicture}
          />
          <View style={inputWrapperStyles}>
            <TextInput
              ref={inputRef}
              placeholder={`Add a comment...`}
              placeholderTextColor={"#858585"}
              style={styles.textInput}
              value={value}
              onChangeText={setValue}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCapitalize="sentences"
              autoCorrect
              maxLength={255}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSubmitComment}
              blurOnSubmit={false}
            />
            {!isLoading ? (
              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={!canPost}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.postBtn,
                    canPost ? styles.postBtnActive : styles.postBtnDisabled,
                  ]}
                >
                  Post
                </Text>
              </TouchableOpacity>
            ) : (
              <ActivityIndicator style={styles.activityIndicator} />
            )}
          </View>
        </View>
      </View>
    );
  }
);

export default FooterTextInput;

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#232325",
  },
  divider: {
    height: 1,
    backgroundColor: "#444",
  },
  iconContainer: {
    gap: 1,
    marginLeft: -4,
    marginVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatIcon: {
    fontSize: 29,
  },
  writingContainer: {
    flexDirection: "row",
    gap: 15,
  },
  profilePicture: {
    height: 45,
    width: 45,
    borderRadius: 50,
  },
  inputWrapper: {
    width: 295,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#777",
    paddingLeft: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingVertical: 8,
    marginBottom: 8,
  },
  inputWrapperFocused: {
    borderColor: "#09f",
  },
  textInput: {
    fontSize: 16,
    flex: 1,
    fontWeight: "400",
    color: "#fff",
    maxWidth: "78%",
    marginBottom: 5,
    padding: 0,
  },
  postBtn: {
    fontSize: 18,
    fontWeight: "700",
    paddingRight: 12,
  },
  postBtnActive: {
    color: "#09f",
  },
  postBtnDisabled: {
    color: "#555",
  },
  activityIndicator: {
    marginRight: 20,
  },
});


