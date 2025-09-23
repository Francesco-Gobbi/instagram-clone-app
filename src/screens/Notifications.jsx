import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from "react";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import Requests from "../components/follow/Requests";
import Interaction from "../components/notifications/Interaction";
import useFetchRequests from "../hooks/useFetchRequests";
import useFetchUserPosts from "../hooks/useFetchUserPosts";
import { LinearGradient } from "expo-linear-gradient";
import { STORY_GRADIENT_COLORS } from "../utils/theme";
import { SIZES } from "../constants";
import firebase from "../services/firebase";

const Notifications = ({ navigation, route }) => {
  const { currentUser } = route.params;
  const { posts } = useFetchUserPosts(currentUser.email);
  const { requests } = useFetchRequests({ user: currentUser });
  const [notificationCounter, setNotificationCounter] = useState(0);
  const [notificationsData, setNotificationsData] = useState([]);

  useEffect(() => {
    if ((currentUser?.event_notification ?? 0) > 0) {
      try {
        firebase.firestore().collection("users").doc(currentUser.email).update({
          event_notification: 0,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, []);

  const normalizeLikePayload = (raw) => {
    if (!raw) {
      return null;
    }

    if (Array.isArray(raw)) {
      const [username, profile_picture, email] = raw;
      if (!username && !profile_picture && !email) {
        return null;
      }

      return {
        username: username || "",
        profile_picture: profile_picture || "",
        email: email || "",
      };
    }

    if (typeof raw === "object") {
      const { username, profile_picture, email, likedAt } = raw;

      if (!username && !profile_picture && !email) {
        return null;
      }

      return {
        username: username || "",
        profile_picture: profile_picture || "",
        email: email || "",
        likedAt,
      };
    }

    return null;
  };

  useEffect(() => {
    if (!Array.isArray(posts) || posts.length === 0) {
      const requestsCount = currentUser?.followers_request?.length || 0;
      setNotificationsData([]);
      setNotificationCounter(requestsCount);
      return;
    }

    const items = [];

    posts.forEach((post) => {
      if (!post || post.id === "empty") {
        return;
      }

      const comments = Array.isArray(post.comments) ? post.comments : [];
      const lastComment = comments.length > 0 ? comments[comments.length - 1] : null;

      if (
        lastComment &&
        lastComment.email &&
        lastComment.email !== currentUser.email
      ) {
        items.push({
          id: `${post.id}_comment_${lastComment.id || lastComment.createdAt || Date.now()}`,
          type: "comment",
          post,
          actor: {
            username: lastComment.username,
            email: lastComment.email,
            profile_picture: lastComment.profile_picture,
          },
          createdAt:
            typeof lastComment.createdAt?.toMillis === "function"
              ? lastComment.createdAt.toMillis()
              : typeof lastComment.createdAt === "number"
              ? lastComment.createdAt
              : typeof post.createdAt?.toMillis === "function"
              ? post.createdAt.toMillis()
              : post.createdAt || Date.now(),
        });
      }

      const likeData = normalizeLikePayload(post.new_likes);
      if (
        likeData &&
        likeData.email &&
        likeData.email !== currentUser.email
      ) {
        items.push({
          id: `${post.id}_like_${likeData.email}`,
          type: "like",
          post,
          actor: likeData,
          createdAt:
            typeof likeData.likedAt?.toMillis === "function"
              ? likeData.likedAt.toMillis()
              : typeof likeData.likedAt === "number"
              ? likeData.likedAt
              : typeof post.createdAt?.toMillis === "function"
              ? post.createdAt.toMillis()
              : post.createdAt || Date.now(),
        });
      }
    });

    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    setNotificationsData(items);

    const requestsCount = currentUser?.followers_request?.length || 0;
    setNotificationCounter(items.length + requestsCount);
  }, [posts, currentUser]);


  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.titleContainer}
      >
        <MaterialIcons name="arrow-back-ios" size={22} color={"#fff"} />
        <Text style={styles.textTitle}>Notifications</Text>
      </TouchableOpacity>
      {notificationCounter > 0 ? (
        <View>
          {currentUser.followers_request &&
            (currentUser.followers_request?.length || 0) > 0 && (
              <View>
                <Text style={styles.subtitle}>Followers Requests:</Text>
                <FlatList
                  style={{}}
                  data={requests}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => <Requests user={item} />}
                />
              </View>
            )}

          <View>
            <FlatList
              data={notificationsData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Interaction
                  navigation={navigation}
                  notification={item}
                  currentUser={currentUser}
                />
              )}
            />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <LinearGradient
            start={[0.9, 0.45]}
            end={[0.07, 1.03]}
            colors={STORY_GRADIENT_COLORS}
            style={styles.rainbowBorder}
          >
            <AntDesign name="checkcircle" size={58} color={"#000"} />
          </LinearGradient>
          <Text style={styles.title}>No notifications for now</Text>
          <Text style={styles.text}>
            There are no notifications from the past 30 days.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.button}>Back to home</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: Platform.OS === "android" ? 20 : 4,
    gap: 3,
  },
  textTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    transform: [{ scaleY: 1.1 }],
  },
  subtitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
    marginHorizontal: 20,
  },
  footerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: SIZES.Height * 0.18,
    gap: 10,
  },
  rainbowBorder: {
    padding: 3,
    height: 63.5,
    width: 63.5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  text: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    color: "#09f",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyContainer: {
    height: "75%",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 60,
    gap: 15,
  },
  emptyIcon: {
    borderWidth: 4,
    borderColor: "#fff",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    height: 94,
    width: 94,
  },
  emptyTitle: {
    textAlign: "center",
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  emptyButton: {
    color: "#09f",
    fontSize: 16,
    fontWeight: "700",
  },
});
