import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { VideoView, useVideoPlayer } from "expo-video";
import { SIZES } from "../constants";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { STORY_GRADIENT_COLORS } from "../utils/theme";
import { createExpoVideoSource } from "../utils/videoSource";
import { useUserContext } from "../contexts/UserContext";
import { useFocusEffect } from "@react-navigation/native";
import useFetchMoments from "../hooks/useFetchMoments";
import firebase from "../services/firebase";
import Skeleton from "../components/moment/Skeleton";
import MessageModal, {
  handleFeatureNotImplemented,
} from "../components/shared/modals/MessageModal";
import {
  GestureHandlerRootView,
  TapGestureHandler,
} from "react-native-gesture-handler";

const pausePlayer = (player) => {
  if (!player) return;
  if (typeof player.pause === "function") {
    try {
      player.pause();
      return;
    } catch (error) {
      console.warn("Unable to pause Moment player:", error?.message || error);
    }
  }
  if (typeof player.pauseAsync === "function") {
    player.pauseAsync().catch((error) =>
      console.warn("Unable to pause Moment player async:", error?.message || error)
    );
  }
};

const playPlayer = (player) => {
  if (!player) return;
  if (typeof player.play === "function") {
    try {
      player.play();
      return;
    } catch (error) {
      console.warn("Unable to play Moment player:", error?.message || error);
    }
  }
  if (typeof player.playAsync === "function") {
    player.playAsync().catch((error) =>
      console.warn("Unable to play Moment player async:", error?.message || error)
    );
  }
};

const MomentItem = memo(({
  item,
  index,
  currentUser,
  navigation,
  isMuted,
  handleLike,
  handleFeatureNotImplemented,
  setMessageModalVisible,
  videoPlayersRef,
  currentIndex,
  onSingleTap,
}) => {
  const videoSource = useMemo(() => {
    const source = createExpoVideoSource(item?.videoUrl, item?.mimeType);
    if (source) return source;
    return { uri: item?.videoUrl || "" };
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
    if (player) player.muted = isMuted;
  }, [isMuted, player]);

  // gioca solo il Moment visibile; pausa gli altri
  useEffect(() => {
    if (index === currentIndex && player) {
      playPlayer(player);
    } else if (player) {
      pausePlayer(player);
    }
  }, [currentIndex, index, player]);

  const handleUserProfile = () => {
    if (currentUser.email === item.owner_email) {
      navigation.navigate("Main Screen", { screen: "Account" });
    } else {
      navigation.navigate("UserDetail", { email: item.owner_email });
    }
  };

  // gesture refs
  const doubleTapRef = useRef(null);
  const singleTapRef = useRef(null);

  return (
    <View>
      <GestureHandlerRootView>
        {/* Doppio tap = like */}
        <TapGestureHandler
          ref={doubleTapRef}
          numberOfTaps={2}
          maxDelayMs={220}
          maxDist={15}
          onActivated={() => handleLike(item)}
        >
          {/* Singolo tap = mute (attende l’esito del doppio tap) */}
          <TapGestureHandler
            ref={singleTapRef}
            waitFor={doubleTapRef}
            numberOfTaps={1}
            maxDist={15} // se c'è drag per scroll, il tap fallisce → niente mute
            onActivated={onSingleTap}
          >
            <View style={styles.videoContainer}>
              <VideoView
                style={styles.video}
                player={player}
                contentFit="cover"
                nativeControls={false}
                allowsFullscreen={false}
              />
            </View>
          </TapGestureHandler>
        </TapGestureHandler>
      </GestureHandlerRootView>

      <View style={styles.bottomMetaContainer}>
        <View style={styles.userContainer}>
          <View style={styles.rowContainer}>
            <TouchableOpacity onPress={handleUserProfile} style={styles.profileContainer}>
              <LinearGradient
                start={[0.9, 0.45]}
                end={[0.07, 1.03]}
                colors={STORY_GRADIENT_COLORS}
                style={styles.rainbowBorder}
              >
                <Image
                  source={{ uri: item.profile_picture }}
                  style={styles.profilePicture}
                />
              </LinearGradient>
              <Text style={styles.profileUsername}>{item.username}</Text>
              <MaterialCommunityIcons name="check-decagram" size={12} color="#fff" />
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
          <TouchableOpacity onPress={() => handleLike(item)} style={styles.actionButton}>
            {item.likes_by_users.includes(currentUser.email) ? (
              <MaterialCommunityIcons name="cards-heart" size={30} color="#e33" style={styles.heartIcon} />
            ) : (
              <MaterialCommunityIcons name="cards-heart-outline" size={30} color="#fff" style={styles.heartIcon} />
            )}
            <Text style={styles.actionLabel}>{item.likes_by_users.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons name="chat-outline" size={32} color="#fff" style={styles.chatIcon} />
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
            <Feather name="send" size={26} color="#fff" style={styles.sendIcon} />
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
    </View>
  );
});

const Moments = ({ navigation }) => {
  const videoPlayersRef = useRef([]);
  const flatListRef = useRef(null);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [muteButtonVisible, setMuteButtonVisible] = useState(false);

  const { currentUser } = useUserContext();
  const { videos } = useFetchMoments();

  // inizializza array dei player
  useEffect(() => {
    videoPlayersRef.current = new Array(videos.length).fill(null);
    if (videos.length > 0) setCurrentIndex(0);
    else setCurrentIndex(null);
  }, [videos.length]);

  // Auto-play quando entri nella schermata (nessuno stop all’uscita)
  const playCurrent = useCallback(() => {
    const p = videoPlayersRef.current[currentIndex];
    if (p) playPlayer(p);
  }, [currentIndex]);

  const pauseAll = useCallback(() => {
    videoPlayersRef.current.forEach((p) => pausePlayer(p));
  }, []);

  useFocusEffect(
    useCallback(() => {
      playCurrent();
      return () => {
        pauseAll();
      };
    }, [playCurrent, pauseAll])
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    setMuteButtonVisible(true);
    // nasconde il toast dopo 1s
    setTimeout(() => setMuteButtonVisible(false), 1000);
  }, []);

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
      <MomentItem
        item={item}
        index={index}
        currentUser={currentUser}
        navigation={navigation}
        isMuted={isMuted}
        handleLike={handleLike}
        handleFeatureNotImplemented={handleFeatureNotImplemented}
        setMessageModalVisible={setMessageModalVisible}
        videoPlayersRef={videoPlayersRef}
        currentIndex={currentIndex}
        onSingleTap={toggleMute} // tap singolo = mute
      />
    ),
    [
      currentUser,
      navigation,
      isMuted,
      handleLike,
      videoPlayersRef,
      currentIndex,
      setMessageModalVisible,
      toggleMute,
    ]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          style={styles.titleContainer}
        >
          <Text style={styles.titleText}>Moments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("MediaLibrary", { initialSelectedType: "New moment" });
          }}
        >
          <Ionicons name="camera-outline" size={32} color="#fff" style={{ marginTop: 6 }} />
        </TouchableOpacity>
      </View>

      {muteButtonVisible && (
        <Animated.View style={styles.muteContainer} entering={FadeIn} exiting={FadeOut}>
          <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={24} color="#fff" />
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
          pagingEnabled
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.y / event.nativeEvent.layoutMeasurement.height
            );
            setCurrentIndex(newIndex);
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

export default Moments;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    width: SIZES.Width,
    height: Platform.OS === "ios" ? SIZES.Height * 0.913 : SIZES.Height * 0.987,
  },
  videoContainer: {
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
});
