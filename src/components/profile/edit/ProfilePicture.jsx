import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import CameraModule from "../../shared/CameraModule";
import { Image } from "expo-image";

const ProfilePicture = ({
  visible,
  onClose,
  currentUser,
  onPropChange,
  blankUserImageUri = "https://randomuser.me/api/portraits/women/53.jpg",
}) => {
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (capturedPhoto) {
      setPreviewImage(capturedPhoto);
    }
  }, [capturedPhoto]);

  useEffect(() => {
    if (typeof onPropChange === "function") {
      onPropChange(previewImage);
    }
  }, [previewImage, onPropChange]);

  const closeOptions = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleCameraPicture = () => {
    closeOptions();
    setCameraModalVisible(true);
  };

  const handleRemovePicture = () => {
    setPreviewImage(blankUserImageUri);
    closeOptions();
  };

  const renderOptions = () => (
    <TouchableWithoutFeedback onPress={closeOptions}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback>
          <View style={styles.optionsContainer}>
            <Image
              source={{
                uri: previewImage ?? currentUser?.profile_picture ?? undefined,
              }}
              style={styles.previewImage}
            />

            <TouchableOpacity
              onPress={handleCameraPicture}
              style={styles.rowContainer}
            >
              <Feather name="camera" size={26} color="#fff" />
              <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRemovePicture}
              style={styles.rowContainer}
            >
              <Ionicons
                name="trash-outline"
                size={28}
                color="#f44"
                style={{ transform: [{ scaleX: 1.25 }] }}
              />
              <Text style={styles.redText}>Remove current picture</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <>
      <Modal
        animationType="fade"
        transparent
        visible={visible}
        onRequestClose={closeOptions}
      >
        {renderOptions()}
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={cameraModalVisible}
        onRequestClose={() => setCameraModalVisible(false)}
      >
        <CameraModule
          setCameraModalVisible={setCameraModalVisible}
          setCapturedPhoto={setCapturedPhoto}
          options
        />
      </Modal>
    </>
  );
};

export default ProfilePicture;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    backgroundColor: "#232325",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingBottom: 28,
    paddingHorizontal: 22,
  },
  previewImage: {
    alignSelf: "center",
    height: 104,
    width: 104,
    borderRadius: 52,
    marginBottom: 24,
    backgroundColor: "#1a1a1a",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 18,
  },
  redText: {
    color: "#f44",
    fontSize: 16,
    marginLeft: 16,
    fontWeight: "600",
  },
});
