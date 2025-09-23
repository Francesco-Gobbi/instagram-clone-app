import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import Animated, { FadeIn, FadeOut, ZoomInDown } from "react-native-reanimated";
import { SIZES } from "../constants";
import {
  MaterialIcons,
  Ionicons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useUserContext } from "../contexts/UserContext";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import MessageModal, {
  handleFeatureNotImplemented,
} from "../components/shared/modals/MessageModal";
import { LIST } from "../utils/text";
import appwriteService from "../services/appwrite";
import firebase from "../services/firebase";

const NewReel = ({ navigation, route }) => {
  const { selectedImage } = route.params || {};
  const { currentUser } = useUserContext();

  useEffect(() => {
    if (selectedImage?.mediaType && !selectedImage.mediaType.toLowerCase().includes("video")) {
      Alert.alert("Video richiesto", "Per creare un reel devi selezionare un video.");
      navigation.goBack();
    }
  }, [selectedImage, navigation]);

  const [opacity, setOpacity] = useState(0);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Create video player
  const player = useVideoPlayer(selectedImage.uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    setTimeout(() => {
      setOpacity(1);
    }, 400);
  }, []);

  const handleSubmitButton = async () => {
    if (isUploading) {
      return;
    }

    if (!selectedImage?.uri) {
      Alert.alert(
        "Missing video",
        "Select a valid video before uploading."
      );
      return;
    }

    if (!currentUser?.email) {
      Alert.alert(
        "Sign-in required",
        "You need to be signed in to upload a reel."
      );
      return;
    }

    if (!appwriteService.isConfigured()) {
      Alert.alert(
        "Appwrite not configured",
        "Unable to upload the reel because Appwrite is not configured."
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      if (player?.pause) {
        player.pause();
      }
      setIsPlaying(false);

      const extensionFromName =
        selectedImage?.filename?.split(".").pop()?.toLowerCase() || "mp4";
      const safeExtension =
        extensionFromName.length <= 5 ? extensionFromName : "mp4";
      const fileName = `reel_${Date.now()}.${safeExtension}`;

      const uploadResult = await appwriteService.uploadFile(
        selectedImage.uri,
        currentUser.email,
        fileName,
        "video",
        (progress) => {
          if (typeof progress === "number") {
            const normalized = Math.max(
              0,
              Math.min(100, Math.round(progress))
            );
            setUploadProgress(normalized);
          }
        }
      );

      if (!uploadResult?.success || !uploadResult?.fileUrl) {
        throw new Error("Video upload failed.");
      }

      const reelData = {
        videoUrl: uploadResult.fileUrl,
        videoFileId: uploadResult.fileId,
        videoBucketId: appwriteService.bucketId,
        caption: "",
        username: currentUser.username,
        profile_picture: currentUser.profile_picture,
        owner_uid: currentUser.owner_uid,
        owner_email: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        likes_by_users: [],
        new_likes: null,
        comments: [],
        shared: 0,
        duration: selectedImage?.duration || 0,
        mimeType: uploadResult.mimeType,
      };

      await firebase
        .firestore()
        .collection("users")
        .doc(currentUser.email)
        .collection("reels")
        .add(reelData);

      setUploadProgress(100);

      Alert.alert(
        "Reel uploaded",
        "Your reel has been uploaded successfully."
      );

      navigation.navigate("Main Screen", { screen: "Videos" });
    } catch (error) {
      console.error("Upload reel error:", error);
      Alert.alert(
        "Upload error",
        error.message || "We couldn't upload your reel. Please try again."
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePlayPause = () => {
    if (isUploading) {
      return;
    }

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    // Auto-play when component mounts
    const timer = setTimeout(() => {
      player.play();
      setIsPlaying(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { opacity: opacity }]}>
      <View style={styles.imageContainer}>
        <Animated.View
          style={styles.topButtonsContainer}
          entering={ZoomInDown.duration(550)}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color={"#fff"}
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
          <View style={styles.modButtonsContainer}>
            <TouchableOpacity
              onPress={() =>
                handleFeatureNotImplemented(setMessageModalVisible)
              }
              style={styles.modButtonContainer}
            >
              <Feather name="volume-2" size={28} color={"#fff"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handleFeatureNotImplemented(setMessageModalVisible)
              }
              style={styles.modButtonContainer}
            >
              <Text style={styles.modButtonText}>Aa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handleFeatureNotImplemented(setMessageModalVisible)
              }
              style={styles.modButtonContainer}
            >
              <MaterialCommunityIcons
                name="sticker-emoji"
                size={27}
                color={"#fff"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                handleFeatureNotImplemented(setMessageModalVisible)
              }
              style={styles.modButtonContainer}
            >
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={27}
                color={"#fff"}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {Platform.OS === "ios" ? (
          <Animated.Image
            source={{ uri: selectedImage.uri }}
            style={styles.image}
            sharedTransitionTag={selectedImage.id.toString()}
          />
        ) : (
          <Animated.Image
            source={{ uri: selectedImage.uri }}
            style={styles.image}
          />
        )}

        <VideoView
          style={styles.video}
          player={player}
          contentFit="cover"
        />

        <TouchableOpacity
          onPress={handlePlayPause}
          style={styles.playButtonContainer}
        >
          {!isPlaying && (
            <Animated.View
              entering={FadeIn.duration(1000)}
              exiting={FadeOut.duration(1000)}
            >
              <Ionicons name="play" size={50} color="white" />
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
      <Animated.View
        style={styles.bottomButtonsContainer}
        entering={FadeIn.duration(1000)}
      >
        <TouchableOpacity
          onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          style={styles.userContainer}
        >
          <Image
            source={{ uri: currentUser.profile_picture }}
            style={styles.userImage}
          />
          <Text style={styles.userText}>{LIST.stories.video}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleFeatureNotImplemented(setMessageModalVisible)}
          style={styles.userContainer}
        >
          <View style={styles.iconBorder}>
            <MaterialIcons name="stars" size={23} color={"#3b3"} />
          </View>
          <Text style={styles.userText}>Close Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmitButton}
          style={[
            styles.nextButtonContainer,
            isUploading && styles.disabledButton,
          ]}
          disabled={isUploading}
        >
          {isUploading ? (
            <View style={styles.uploadStatus}>
              <ActivityIndicator color="#000" size="small" />
              {uploadProgress > 0 && (
                <Text style={styles.uploadStatusText}>
                  {`${uploadProgress}%`}
                </Text>
              )}
            </View>
          ) : (
            <Ionicons name="arrow-forward" size={30} color={"#000"} />
          )}
        </TouchableOpacity>
      </Animated.View>
      <MessageModal
        messageModalVisible={messageModalVisible}
        message={"This feature is not yet implemented."}
        height={80}
      />
    </View>
  );
};

export default NewReel;

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    backgroundColor: "#000",
    flex: 1,
  },
  topButtonsContainer: {
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    marginTop: -50,
    top: 56,
    marginHorizontal: 12,
  },
  modButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  modButtonContainer: {
    height: 44,
    width: 44,
    borderRadius: 100,
    backgroundColor: "#484040",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.92,
  },
  modButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
    transform: [{ scaleY: 1.1 }],
  },
  image: {
    position: "absolute",
    top: -5,
    width: "100%",
    height:
      Platform.OS === "android" ? SIZES.Height * 0.925 : SIZES.Height * 0.85,
    resizeMode: "cover",
    borderRadius: 25,
    zIndex: -1,
  },
  video: {
    width: "100%",
    height:
      Platform.OS === "android" ? SIZES.Height * 0.925 : SIZES.Height * 0.85,
    borderRadius: 25,
  },
  backButtonContainer: {
    height: 45,
    width: 45,
    borderRadius: 100,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#444040",
    opacity: 0.99,
  },
  buttonIcon: {
    paddingLeft: 10,
  },
  bottomButtonsContainer: {
    height: SIZES.Height * 0.08,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  userContainer: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 30,
    paddingHorizontal: 10,
    backgroundColor: "#333",
  },
  userImage: {
    height: 26,
    width: 26,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#fff",
  },
  userText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginBottom: 4,
  },
  nextButtonContainer: {
    backgroundColor: "#fff",
    height: 45,
    width: 45,
    borderRadius: 100,
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.65,
  },
  uploadStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  uploadStatusText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  iconBorder: {
    backgroundColor: "#fff",
    borderRadius: 100,
  },
  playButtonContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    height: "100%",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

