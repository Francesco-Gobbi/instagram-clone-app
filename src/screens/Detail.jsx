import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Platform, View, StatusBar, Text, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import React, { useState, useEffect, useRef } from "react";
import TitleBar from "../components/shared/TitleBar";
import Animated, {
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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const gesture = Gesture.Pan()

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.container]}
        entering={FadeIn.delay(300).duration(200)}
      >
        {fromSearch ? (
          <View style={styles.searchHeader}>
            <TouchableOpacity
              onPress={handleGoBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="arrow-back-ios" size={27} color="#fff" />
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
          bottomSheetRef={bottomSheetRefComment}
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

