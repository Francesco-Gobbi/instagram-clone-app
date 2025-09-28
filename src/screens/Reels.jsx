import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  TouchableWithoutFeedback,
  Platform,
  StatusBar,
} from "react-native";
import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { VideoView, useVideoPlayer } from "expo-video";
import { SIZES } from "../constants";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { STORY_GRADIENT_COLORS } from "../utils/theme";
import { createExpoVideoSource } from "../utils/videoSource";
import { useUserContext } from "../contexts/UserContext";
import { useIsFocused } from "@react-navigation/native";
import * as Progress from "react-native-progress";
import useFetchReels from "../hooks/useFetchReels";
import usePlayReels from "../hooks/usePlayReels";
import firebase from "../services/firebase";
import Skeleton from "../components/reels/Skeleton";
import MessageModal, {
  handleFeatureNotImplemented,
} from "../components/shared/modals/MessageModal";

const pausePlayer = (player) => {
  if (!player) return;
  if (typeof player.pause === 'function') {
    try {
      player.pause();
      return;
    } catch (error) {
      console.warn('Unable to pause reel player:', error?.message || error);
    }
  }
  if (typeof player.pauseAsync === 'function') {
    player.pauseAsync().catch((error) =>
      console.warn('Unable to pause reel player async:', error?.message || error)
    );
  }
};

const playPlayer = (player) => {
  if (!player) return;
  if (typeof player.play === 'function') {
    try {
      player.play();
      return;
    } catch (error) {
      console.warn('Unable to play reel player:', error?.message || error);
    }
  }
  if (typeof player.playAsync === 'function') {
    player.playAsync().catch((error) =>
      console.warn('Unable to play reel player async:', error?.message || error)
    );
  }
};

const ReelItem = memo(({ 
  item,
  index,
  currentUser,
  navigation,
  isMuted,
  handleLike,
  handleFeatureNotImplemented,
  setMessageModalVisible,
  handleLongPress,
  handlePressOut,
  handlePress,
  setCurrentIndex,
  videoPlayersRef,
  progressBarValue,
}) => {
  const videoSource = useMemo(() => {
    const source = createExpoVideoSource(item?.videoUrl, item?.mimeType);
    if (source) {
      return source;
    }
    return { uri: item?.videoUrl || '' };
  }, [item?.videoUrl, item?.mimeType]);

  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = isMuted;
  });

  useEffect(() => {
    videoPlayersRef.current[index] = player;
    return () => {
      if (videoPlayersRef.current[index] === player) {
        videoPlayersRef.current[index] = null;
      }
      pausePlayer(player);
    };
  }, [index, player, videoPlayersRef]);

  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  const handleUserProfile = () => {
    if (currentUser.email === item.owner_email) {
      navigation.navigate("Main Screen", { screen: "Account" });
    } else {
      navigation.navigate("UserDetail", {
        email: item.owner_email,
      });
    }
  };

  return (
    <View>
      <TouchableWithoutFeedback
        delayLongPress={200}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <View>
          <VideoView
            style={styles.video}
            player={player}
            contentFit="cover"
            onLoad={() => {
              if (index === 0) {
                setCurrentIndex(0);
                player.play();
              }
            }}
          />
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.bottomMetaContainer}>
        <View style={styles.userContainer}>
          <View style={styles.rowContainer}>
            <TouchableOpacity
              onPress={handleUserProfile}
              style={styles.profileContainer}
            >
              <LinearGradient
                start={[0.9, 0.45]}
                end={[0.07, 1.03]}
                colors={STORY_GRADIENT_COLORS}
                style={styles.rainbowBorder}
              >
                <Image
                  source={{
                    uri: item.profile_picture,
                  }}
                  style={styles.profilePicture}
                />
              </LinearGradient>
              <Text style={styles.profileUsername}>{item.username}</Text>
              <MaterialCommunityIcons
                name="check-decagram"
                size={12}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity}>
              <View style={styles.followContainer}>
                <Text style={styles.followText}>Follow</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.captionText}>{item.caption}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => handleLike(item)}
            style={styles.actionButton}
          >
            {item.likes_by_users.includes(currentUser.email) ? (
              <MaterialCommunityIcons
                name="cards-heart"
                size={30}
                color="#e33"
                style={styles.heartIcon}
              />
            ) : (
              <MaterialCommunityIcons
                name="cards-heart-outline"
                size={30}
                color="#fff"
                style={styles.heartIcon}
              />
            )}
            <Text style={styles.actionLabel}>{item.likes_by_users.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name="chat-outline"
              size={32}
              color="#fff"
              style={styles.chatIcon}
            />
            <Text style={styles.actionLabel}>{item.comments.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const chatUser = {
                email: item.owner_email,
                username: item.username,
                name: item.name || item.username,
                profile_picture: item.profile_picture,
              };
              if (chatUser.email === currentUser.email) {
                navigation.navigate("Chat");
              } else {
                navigation.navigate("Chating", { user: chatUser });
              }
            }}
            style={styles.actionButton}
          >
            <Feather
              name="send"
              size={26}
              color="#fff"
              style={styles.sendIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
            style={styles.actionButton}
          >
            <Ionicons name="ellipsis-horizontal" size={26} color="#fff" />
            <Text style={styles.actionLabel}>{item.shared}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Progress.Bar
          progress={progressBarValue}
          width={SIZES.Width}
          height={1.2}
          useNativeDriver={true}
          color="#fff"
          style={styles.progressBar}
        />
      </View>
    </View>
  );
});

const Reels = ({ navigation }) => {
  const videoPlayersRef = useRef([]);
  const flatListRef = useRef(null);
  const focusedScreen = useIsFocused();
  const [messageModalVisible, setMessageModalVisible] = useState(false);

  const { currentUser } = useUserContext();
  const { videos } = useFetchReels();
  const {
    playingVideo,
    setCurrentIndex,
    progressBarValue,
    muteButtonVisible,
    isMuted,
    handleLongPress,
    handlePressOut,
    handlePress,
  } = usePlayReels({ videoRefs: videoPlayersRef, focusedScreen });

  useEffect(() => {
    videoPlayersRef.current = new Array(videos.length).fill(null);
    if (videos.length > 0) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(null);
    }
  }, [videos.length, setCurrentIndex]);

  const handleLike = (item) => {
    firebase
      .firestore()
      .collection("users")
      .doc(item.owner_email)
      .collection("reels")
      .doc(item.id)
      .update({
        likes_by_users: item.likes_by_users.includes(currentUser.email)
          ? firebase.firestore.FieldValue.arrayRemove(currentUser.email)
          : firebase.firestore.FieldValue.arrayUnion(currentUser.email),
      });
  };

  const renderItem = useCallback(
    ({ item, index }) => (
      <ReelItem
        item={item}
        index={index}
        currentUser={currentUser}
        navigation={navigation}
        isMuted={isMuted}
        handleLike={handleLike}
        handleFeatureNotImplemented={handleFeatureNotImplemented}
        setMessageModalVisible={setMessageModalVisible}
        handleLongPress={handleLongPress}
        handlePressOut={handlePressOut}
        handlePress={handlePress}
        setCurrentIndex={setCurrentIndex}
        videoPlayersRef={videoPlayersRef}
        progressBarValue={progressBarValue}
      />
    ),
    [
      currentUser,
      navigation,
      isMuted,
      handleLike,
      handleLongPress,
      handlePressOut,
      handlePress,
      setCurrentIndex,
      videoPlayersRef,
      progressBarValue,
      setMessageModalVisible,
    ]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          style={styles.titleContainer}
        >
          <Text style={styles.titleText}>Reels</Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={22}
            color="#fff"
            style={{ marginTop: 6 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("MediaLibrary", {
              initialSelectedType: "New reel",
            });
          }}
        >
          <Ionicons
            name="camera-outline"
            size={32}
            color="#fff"
            style={{ marginTop: 6 }}
          />
        </TouchableOpacity>
      </View>

      {muteButtonVisible && (
        <Animated.View
          style={styles.muteContainer}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <Ionicons
            name={isMuted ? "volume-mute" : "volume-high"}
            size={24}
            color="#fff"
          />
        </Animated.View>
      )}

      {videos.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString()}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          pagingEnabled={true}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.y /
                event.nativeEvent.layoutMeasurement.height
            );

            const previousPlayer = videoPlayersRef.current[newIndex - 1];
            const nextPlayer = videoPlayersRef.current[newIndex + 1];
            pausePlayer(previousPlayer);
            pausePlayer(nextPlayer);

            const currentPlayer = videoPlayersRef.current[newIndex];
            if (playingVideo && currentPlayer) {
              playPlayer(currentPlayer);
              setCurrentIndex(newIndex);
            }
          }}
        />
      ) : (
        <View style={{ flex: 1, marginTop: 0 }}>
          <Skeleton />
        </View>
      )}
      <MessageModal
        messageModalVisible={messageModalVisible}
        message={"This feature is not yet implemented."}
        height={20}
      />
    </View>
  );
};

export default Reels;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    width: SIZES.Width,
    height: Platform.OS === "ios" ? SIZES.Height * 0.913 : SIZES.Height * 0.987,
  },
  video: {
    width: SIZES.Width,
    height: Platform.OS === "ios" ? SIZES.Height * 0.913 : SIZES.Height * 0.987,
  },
  muteContainer: {
    position: "absolute",
    top: SIZES.Height * 0.42,
    left: SIZES.Width * 0.42,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#666",
    borderRadius: 100,
    padding: 20,
    zIndex: 3,
  },
  headerContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 30 : StatusBar.currentHeight - 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 15,
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 23,
  },
  bottomMetaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingBottom: 4,
  },
  actionButton: {
    alignItems: "center",
  },
  actionLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 4,
  },
  touchableOpacity: {
    alignItems: "center",
    gap: 3,
  },
  heartIcon: {
    transform: [{ scaleY: 1.2 }, { scaleX: 1.2 }],
  },
  chatIcon: {
    transform: [{ scaleX: -1 }, { scaleY: 1.2 }, { scaleX: 1.2 }],
  },
  sendIcon: {
    transform: [{ rotate: "20deg" }, { scaleY: 1.2 }, { scaleX: 1.2 }],
  },
  userContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 12,
    paddingLeft: 4,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rainbowBorder: {
    height: 40.5,
    width: 40.5,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  profilePicture: {
    height: 39,
    width: 39,
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 100,
  },
  profileUsername: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 3,
    marginBottom: 4,
  },
  followContainer: {
    borderWidth: 0.7,
    borderColor: "#bbb",
    backgroundColor: "transparent",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 10,
  },
  followText: {
    color: "#fff",
    fontWeight: "700",
  },
  captionText: {
    color: "#fff",
    fontWeight: "400",
    fontSize: 14,
    marginTop: 4,
    maxWidth: SIZES.Width * 0.8,
    marginBottom: 14,
  },
  progressBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 22 : 16,
    zIndex: 1,
  },
});


