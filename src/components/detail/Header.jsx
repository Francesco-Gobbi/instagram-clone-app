import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { COLORS } from "../../utils/usePalete";
import React, { useEffect, useState } from "react";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import ModalNotification from "../notifications/ModalNotification";
import { SIZES } from "../../constants";

const Header = ({ navigation, headerOpacity, currentUser, post }) => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);

  useEffect(() => {
    if ((currentUser?.event_notification ?? 0) > 0) {
      setNotificationModal(true);

      setTimeout(() => {
        setNotificationModal(false);
      }, 4000);
    } else {
      setNotificationModal(false);
    }
  }, [currentUser]);

  const handleUserProfile = () => {
    if (currentUser?.email && post?.owner_email && currentUser.email === post.owner_email) {
      navigation.navigate("Main Screen", { screen: "Account" });
    } else {
      navigation.navigate("UserDetail", { email: post?.owner_email });    }
  };

  return (
    <Animated.View style={{ opacity: headerOpacity }}>
        <View style={styles.rowContainer}>
          <TouchableOpacity onPress={handleUserProfile} style={styles.profileContainer}>
            <Image
              source={ post?.profile_picture ? { uri: post.profile_picture } : "" }
              style={styles.profilePicture}
            />
          <Text style={styles.profileUsername}>{post?.username ?? ""}</Text>        
          <MaterialCommunityIcons name="check-decagram" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      <Modal
        visible={filterModalVisible}
        animationType="fade"
        transparent={true}
      >
        <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <BlurView intensity={70} style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.modalRowContainer}
                onPress={() => {
                  navigation.navigate("Following");
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.modalText}>Connections</Text>
                <Feather name="users" size={26} color={"#fff"} />
              </TouchableOpacity>
              <View style={styles.modalDivider} />
              <TouchableOpacity
                style={styles.modalRowContainer}
                onPress={() => {
                  navigation.navigate("Favorites");
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.modalText}>Favorites</Text>
                <Feather name="star" size={28} color={"#fff"} />
              </TouchableOpacity>
            </BlurView> 
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {notificationModal && (
        <ModalNotification
          setNotificationModal={setNotificationModal}
          notificationCounter={currentUser.event_notification}
        />
      )}
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "android" ? 24 : 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignposts: "center",
    marginRight: 20,
    zIndex: 1,
  },
  userContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 12,
    paddingLeft: 4,
  },
  rowContainer: {
    paddingTop: 15,
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
  ShentaoHubContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignposts: "center",
    marginLeft: 14,
  },
  logo: {
    width: 128,
    height: 42,
    contentFit: "cover",
  },
  iconsContainer: {
    flexDirection: "row",
    marginLeft: 15,
  },
  messenger: {
    marginTop: 1,
    width: 28,
    height: 27,
  },
  unreadBadgeSmallContainer: {
    backgroundColor: "#FF3250",
    position: "absolute",
    right: 0,
    top: 1,
    height: 9,
    width: 9,
    borderRadius: 10,
    zIndex: 2,
    justifyContent: "center",
    alignposts: "center",
  },
  unreadBadgeContainer: {
    backgroundColor: COLORS.red,
    position: "absolute",
    right: -5,
    top: -3,
    height: 16,
    width: 16,
    borderRadius: 10,
    zIndex: 2,
    justifyContent: "center",
    alignposts: "center",
  },
  unreadBadgeText: {
    fontWeight: "600",
    fontSize: 11,
    color: "white",
    paddingBottom: 1,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.border,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : SIZES.Height * 0.07,
    left: 22,
    backgroundColor: "rgba(26,26,26,0.9)",
    borderRadius: 15,
    overflow: "hidden",
  },
  modalRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignposts: "center",
    gap: 15,
    marginRight: 15,
    height: 46,
  },
  modalText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
    marginHorizontal: 15,
  },
  modalDivider: {
    width: "100%",
    height: 0.5,
    backgroundColor: "#fff",
  },
});
