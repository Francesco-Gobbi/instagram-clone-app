import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import useCheckStoriesSeen from "../../hooks/useCheckStoriesSeen";
import { LinearGradient } from "expo-linear-gradient";
import { STORY_GRADIENT_COLORS } from "../../utils/theme";

const Interaction = ({ navigation, notification, currentUser }) => {
  const { checkStoriesSeen } = useCheckStoriesSeen();
  const { type, post, actor } = notification || {};

  const actorUsername = actor?.username || "Unknown";
  const actorEmail = actor?.email;
  const avatarUri =
    actor?.profile_picture ||
    post?.profile_picture ||
    post?.owner_profile_picture ||
    post?.imageUrl ||
    currentUser?.profile_picture;
  const postPreviewUri = post?.imageUrl || post?.thumbnail || avatarUri;

  const handleUserProfile = () => {
    if (!actorEmail) {
      return;
    }
    navigation.navigate("UserDetail", {
      email: actorEmail,
    });
  };

  const handleCheckPost = () => {
    navigation.navigate("Detail", { item: post, fromProfile: false });
  };

  const showStoryBorder =
    type === "comment" &&
    actorUsername &&
    checkStoriesSeen(actorUsername, currentUser.email);

  const interactionLabel =
    type === "comment" ? "Commented your post." : "Liked your post.";

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <TouchableOpacity
          onPress={handleUserProfile}
          disabled={!actorEmail}
        >
          {showStoryBorder ? (
            <LinearGradient
              start={[0.9, 0.45]}
              end={[0.07, 1.03]}
              colors={STORY_GRADIENT_COLORS}
              style={styles.rainbowBorder}
            >
              <Image
                source={{ uri: avatarUri }}
                style={styles.image}
              />
            </LinearGradient>
          ) : (
            <Image
              source={{ uri: avatarUri }}
              style={styles.nonRainbowImage}
            />
          )}
        </TouchableOpacity>
        <View style={styles.userContainer}>
          <TouchableOpacity
            onPress={handleUserProfile}
            disabled={!actorEmail}
          >
            <Text style={styles.username}>{actorUsername}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCheckPost}>
            <Text style={styles.name}>{interactionLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCheckPost}>
          <Image source={{ uri: postPreviewUri }} style={styles.postImage} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Interaction;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginTop: Platform.OS === "android" ? 15 : 8,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rainbowBorder: {
    borderRadius: 100,
    height: 58,
    width: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 56,
    width: 56,
    borderRadius: 100,
    borderWidth: 2.5,
    borderColor: "#000",
  },
  nonRainbowImage: {
    height: 58,
    width: 58,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 100,
  },
  userContainer: {
    justifyContent: "center",
    marginLeft: 15,
  },
  username: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  name: {
    color: "#ddd",
    fontSize: 13,
    fontWeight: "400",
  },
  postImage: {
    height: 60,
    width: 60,
    marginRight: 2,
  },
});
