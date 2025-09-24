import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Platform, View, StatusBar, Text, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import React, { useState, useEffect, useRef } from "react";
import TitleBar from "../components/shared/TitleBar";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  FadeIn,
  runOnJS
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useUserContext } from "../contexts/UserContext";
import BottomSheetOptions from "../components/detail/bottomSheets/BottomSheetOptions";
import BottomSheetComments from "../components/detail/bottomSheets/BottomSheetComments";
import BottomSheetComment from "../components/detail/bottomSheets/BottomSheetComment";
import useFetchUserPosts from "../hooks/useFetchUserPosts";
import RenderItem from "../components/detail/RenderItem";

const Detail = ({ navigation, route }) => {
  const { item } = route.params || {};
  const entryPoint = route.params?.entryPoint;
  const fromProfile = route.params?.fromProfile ?? false;
  const fromSearch = entryPoint === "search";
  const { currentUser } = useUserContext();
  const { timeToReplaceData, onSnapshotData } = useFetchUserPosts(
    item.owner_email
  );

  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const bottomSheetRefOptions = useRef(null);
  const bottomSheetRefComments = useRef(null);
  const bottomSheetRefComment = useRef(null);

  const [posts, setPosts] = useState([item]);
  const authorEmail = item?.owner_email;
  const authorUsername = item?.username || item?.owner_username || item?.owner_name || "";
  const authorFullName = item?.name || "";
  const authorAvatar = item?.profile_picture || item?.owner_profile_picture || null;
  const isAuthorCurrentUser = authorEmail && authorEmail === currentUser.email;


  useEffect(() => {
    if (timeToReplaceData > 0) {
      const moveItemToStart = (arr) => {
        const index = arr.findIndex((post) => item.id === post.id);
        if (index !== -1 || index !== 0) {
          const itemToMove = arr.splice(index, 1)[0];
          arr.unshift(itemToMove);
          setPosts(arr);
        } else {
          setPosts(arr);
        }
      };
      moveItemToStart(onSnapshotData);
    }
  }, [timeToReplaceData]);

  const handleOpenAuthorProfile = () => {
    if (!authorEmail) {
      return;
    }

    if (isAuthorCurrentUser) {
      navigation.navigate('Main Screen', { screen: 'Account' });
    } else {
      navigation.navigate('UserDetail', { email: authorEmail });
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };


  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .onUpdate((value) => {
      translateX.value = value.translationX * 0.8;
      translateY.value = value.translationY * 0.8;
      const distance = Math.sqrt(
        value.translationX * value.translationX +
          value.translationY * value.translationY
      );
      const scaleValue = Math.min(Math.max(distance / 100, 1), 0.9);
      scale.value = withTiming(scaleValue, { duration: 100 });
    })
    .onEnd(() => {
      if (translateY.value > 75) {
        opacity.value = 0;
        runOnJS(navigation.goBack)();
      } else {
        translateX.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(1, { duration: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    backgroundColor: interpolateColor(
      opacity.value,
      [0, 1],
      ["transparent", "#000"]
    ),
    borderRadius: 20,
    overflow: "hidden",
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.container, animatedStyle]}
        entering={FadeIn.delay(300).duration(200)}
      >
        {fromSearch ? (
          <View style={styles.searchHeader}>
            <TouchableOpacity
              onPress={handleGoBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleOpenAuthorProfile}
              style={styles.searchAuthorInfo}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {authorAvatar ? (
                <Image source={{ uri: authorAvatar }} style={styles.searchAuthorAvatar} />
              ) : (
                <View style={styles.searchAvatarPlaceholder}>
                  <MaterialIcons name="person" size={18} color="#000" />
                </View>
              )}
              <View style={styles.searchAuthorTextContainer}>
                <Text style={styles.searchAuthorUsername}>
                  {isAuthorCurrentUser ? currentUser.username : authorUsername || "Profilo"}
                </Text>
                {!!authorFullName && (
                  <Text style={styles.searchAuthorName}>{authorFullName}</Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.searchHeaderSpacer} />
          </View>
        ) : (
          !fromProfile && (
            <TitleBar navigation={navigation} name="Detail" activity={false} />
          )
        )}
        {fromProfile && (
          <TouchableOpacity
            style={styles.fixedBackButton}
            onPress={handleGoBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MaterialIcons name="arrow-back-ios" size={26} color="#fff" />
          </TouchableOpacity>
        )}
        <FlatList
          data={posts}
          snapToInterval={layoutHeight - 10}
          snapToAlignment={"start"}
          decelerationRate={"fast"}
          renderItem={({ item, index }) => (
            <RenderItem
              navigation={navigation}
              post={item}
              currentUser={currentUser}
              bottomSheetRefComments={bottomSheetRefComments}
              bottomSheetRefComment={bottomSheetRefComment}
              bottomSheetRefOptions={bottomSheetRefOptions}
              setBottomSheetIndex={setBottomSheetIndex}
              sharedIndex={index}
              setLayoutHeight={setLayoutHeight}
              fromProfileView={fromProfile}
            />
          )}
          ListFooterComponent={() => <View style={{ height: 100 }} />}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
        <BottomSheetOptions
          bottomSheetRef={bottomSheetRefOptions}
          navigation={navigation}
          post={posts[bottomSheetIndex]}
          currentUser={currentUser}
        />
        <BottomSheetComments
          bottomSheetRef={bottomSheetRefComments}
          post={posts[bottomSheetIndex]}
          currentUser={currentUser}
          navigation={navigation}
        />
        <BottomSheetComment
          bottomSheetRefComment={bottomSheetRefComment}
          post={posts[bottomSheetIndex]}
          currentUser={currentUser}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default Detail;

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 44,
    flex: 1,
    backgroundColor: "#000",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchAuthorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 12,
  },
  searchAuthorAvatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  searchAvatarPlaceholder: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  searchHeaderSpacer: {
    width: 24,
  },
  fixedBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : (StatusBar.currentHeight || 0) + 24,
    left: 18,
    zIndex: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  searchAuthorUsername: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  searchAuthorName: {
    color: "#bbb",
    fontSize: 13,
  },
  searchAuthorTextContainer: {
    marginLeft: 12,
    flexShrink: 1,
  },
});
