import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Progress from "react-native-progress";
import { SIZES } from "../constants";
import useProgressBarTimer from "../utils/useProgressBarTimer";
import useSeenStory from "../hooks/useSeenStory";
import useSharePost from "../hooks/useSharePost";
import useHandleLike from "../hooks/useHandleLike";
import Animated, { ZoomIn } from "react-native-reanimated";
import useChatSendMessage from "../hooks/useChatSendMessage";
import BottomSheetOptions from "../components/story/BottomSheetOptions";

const Story = ({ navigation, route }) => {
  const { stories = [], currentUser } = route.params || {};
  const progressWidth = SIZES.Width * 0.95;
  const segmentGap = 4;
  const progressSegmentWidth = stories?.length
    ? (progressWidth - segmentGap * Math.max(stories.length - 1, 0)) / stories.length
    : progressWidth;
  const loadingRowStyle = [styles.loadingBarRow, { width: progressWidth }];
  const { handleResume, handlePause, nextStory, prevStory, currentStoryIndex, progressBar } =
    useProgressBarTimer({ stories, navigation });
  useSeenStory({ stories, currentUser, currentStoryIndex });
  const activeStory = stories[currentStoryIndex] || {};

  const { shareStory } = useSharePost();
  const { handleStoryLike } = useHandleLike();

  const [focusedBar, setFocusedBar] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const initialLiked = Array.isArray(activeStory.likes_by_users)
    ? activeStory.likes_by_users.includes(currentUser.email)
    : false;
  const [isLiked, setIsLiked] = useState({
    [currentStoryIndex]: initialLiked,
  });

  useEffect(() => {
    const liked = Array.isArray(activeStory.likes_by_users)
      ? activeStory.likes_by_users.includes(currentUser.email)
      : false;
    setIsLiked({ [currentStoryIndex]: liked });
  }, [currentStoryIndex, activeStory?.likes_by_users, currentUser.email]);

  const user = {
    email: activeStory.owner_email,
    username: activeStory.username,
    name: activeStory.name,
    profile_picture: activeStory.profile_picture,
  };
  const { chatSendMessage, loading, textMessage, setTextMessage } =
    useChatSendMessage({ user, currentUser });
  const bottomSheetRef = useRef(null);

  const handleToggleLike = () => {
    handleStoryLike(activeStory, currentUser);
    setIsLiked({ [currentStoryIndex]: !isLiked[currentStoryIndex] });
  };

  const handleOnSubmit = async () => {
    await chatSendMessage();

    if (keyboardVisible) {
      Keyboard.dismiss();
      handleResume();
    }
  };

  const handleSkipForward = () => {
    handlePause();
    nextStory();
  };

  const handleSkipBackward = () => {
    handlePause();
    prevStory();
  };

  const handleStoryShare = async () => {
    handlePause();
    await shareStory(activeStory);
    handleResume();
  };

  const handleOptionsSheet = () => {
    handlePause();
    bottomSheetRef.current.present();
  };

  const handleViewProfile = () => {
    handlePause();
    if (activeStory.owner_email === currentUser.email) {
      navigation.navigate('Main Screen', { screen: 'Account' });
    } else {
      navigation.navigate('UserDetail', { email: activeStory.owner_email });
    }
  };

  const handleOnFocus = () => {
    setKeyboardVisible(true);
    setFocusedBar(true);
    handlePause();
  };

  const handleOnBlur = () => {
    setKeyboardVisible(false);
    setFocusedBar(false);
  };

  return (
    <Animated.View entering={ZoomIn.duration(150)} style={styles.container}>
      <Image
        source={activeStory.imageUrl ? { uri: activeStory.imageUrl } : undefined}
        style={styles.image}
      />
      <View pointerEvents="box-none" style={styles.topOverlay}>
        <View style={loadingRowStyle}>
          {stories.map((_, index) => {
            const progress = index < currentStoryIndex ? 1 : index === currentStoryIndex ? progressBar : 0;
            return (
              <View key={index.toString()} style={styles.loadingBarSegment}>
                <Progress.Bar
                  progress={progress}
                  width={progressSegmentWidth}
                  height={2}
                  color="#fff"
                  unfilledColor="rgba(255,255,255,0.3)"
                  borderWidth={0}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.subheaderContent}>
          <TouchableOpacity
            onPress={handleViewProfile}
            style={styles.rowContainer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={{ uri: activeStory.profile_picture }}
              style={styles.profilePicture}
            />

            <Text style={styles.usernameText}>
              {activeStory.owner_email === currentUser.email
                ? 'Your story'
                : activeStory.username}
            </Text>
          </TouchableOpacity>
          {/* Add Send and More in header between username and Close */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={handleStoryShare}
            >
              <Feather name="send" size={22} color="#fff" style={styles.headerActionSendIcon} />
              <Text style={styles.headerActionText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={handleOptionsSheet}
            >
              <MaterialCommunityIcons name="dots-horizontal" size={24} color="#fff" />
              <Text style={styles.headerActionText}>More</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name="close-outline"
              size={44}
              color="#fff"
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableWithoutFeedback
        onPressIn={() => {
          handlePause();
          Keyboard.dismiss();
        }}
        onPressOut={() => handleResume()}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.navigationOverlay} pointerEvents="box-none">
            <Pressable
              style={[styles.navigationZone, styles.navigationZoneLeft]}
              onPress={handleSkipBackward}
              onPressIn={handlePause}
              onPressOut={handleResume}
            />
            <Pressable
              style={[styles.navigationZone, styles.navigationZoneRight]}
              onPress={handleSkipForward}
              onPressIn={handlePause}
              onPressOut={handleResume}
            />
          </View>
          {activeStory.owner_email !== currentUser.email ? (
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Send message"
                  placeholderTextColor={"#fff"}
                  style={styles.textInput}
                  onFocus={() => handleOnFocus()}
                  onBlur={() => handleOnBlur()}
                  value={textMessage}
                  onChangeText={(text) => setTextMessage(text)}
                  autoCapitalize="sentences"
                  autoCorrect={true}
                  maxLength={255}
                  multiline
                />
                {focusedBar &&
                  textMessage !== "" &&
                  (loading ? (
                    <ActivityIndicator />
                  ) : (
                    <TouchableOpacity onPress={() => handleOnSubmit()}>
                      <Text style={styles.sendBtn}>Send</Text>
                    </TouchableOpacity>
                  ))}
              </View>

              {!focusedBar && (
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => handleToggleLike()}>
                    {isLiked[currentStoryIndex] ? (
                      <Ionicons name="heart" size={30} color={"#f00"} />
                    ) : (
                      <Ionicons name="heart-outline" size={30} color={"#fff"} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            null
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <BottomSheetOptions
        bottomSheetRef={bottomSheetRef}
        story={activeStory}
        handleResume={handleResume}
        navigation={navigation}
      />
    </Animated.View>
  );
};

export default Story;

const styles = StyleSheet.create({
  navigationOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 120 : (StatusBar.currentHeight || 0) + 120,
    left: 0,
    right: 0,
    bottom: SIZES.Height * 0.25,
    flexDirection: "row",
    zIndex: 2,
  },
  navigationZone: {
    flex: 1,
  },
  navigationZoneLeft: {
  },
  navigationZoneRight: {
  },
  topOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 24,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    zIndex: 3,
  },
  loadingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "center",
    marginBottom: 12,
  },
  loadingBarSegment: {
    flex: 0,
    height: 2,
    marginHorizontal: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 48,
  },
  image: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    height:
      Platform.OS === "android" ? SIZES.Height * 0.925 : SIZES.Height * 0.86,
    width: "100%",
    borderRadius: 15,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "space-between",
  },
  subheaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginHorizontal: 15,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profilePicture: {
    height: 40,
    width: 40,
    borderRadius: 100,
  },
  usernameText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    paddingBottom: 4,
  },
  closeIcon: {
    margin: -11,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  headerActionSendIcon: {
    transform: [{ rotate: '20deg' }],
    marginTop: -2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: Platform.OS === "android" ? 10 : 20,
  },
  inputWrapper: {
    flex: 1,
    minHeight: 40,
    borderWidth: 0.5,
    borderColor: "#fff",
    borderRadius: 20,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 3,
    paddingBottom: 8,
    paddingHorizontal: 15,
  },
  textInput: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "500",
    maxWidth: SIZES.Width * 0.7,
    minWidth: SIZES.Width * 0.6,
  },
  sendBtn: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    gap: 10,
  },
});






