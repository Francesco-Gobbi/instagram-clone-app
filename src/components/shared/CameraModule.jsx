import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef, useState } from "react";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SIZES } from "../../constants";
import CameraNoPermission from "./CameraNoPermission";
import useImageGallery from "../../hooks/useImageGallery";

// Costanti sicure per la camera
const CAMERA_TYPE = {
  BACK: "back",
  FRONT: "front",
};

const FLASH_MODE = {
  OFF: "off",
  ON: "on",
  AUTO: "auto",
};

const CameraModule = ({
  setCameraModalVisible,
  setCapturedPhoto,
  setSelectedType = null,
  selectedType = "New post",
  options = false,
}) => {
  const camRef = useRef(null);
  const [facing, setFacing] = useState(CAMERA_TYPE.BACK);
  const [flashMode, setFlashMode] = useState(FLASH_MODE.OFF);
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const normalizedSelectedType = (selectedType || "").toLowerCase();
  const allowVideoMode =
    normalizedSelectedType === "new moment" ||
    normalizedSelectedType === "add to story";
  const allowPhotoMode = normalizedSelectedType !== "new moment";
  const defaultCaptureMode =
    allowVideoMode && !allowPhotoMode ? "video" : "photo";
  const [captureMode, setCaptureMode] = useState(defaultCaptureMode);

  useEffect(() => {
    setCaptureMode((previousMode) => {
      if (!allowVideoMode) {
        return "photo";
      }
      if (!allowPhotoMode) {
        return "video";
      }
      return previousMode;
    });
  }, [allowPhotoMode, allowVideoMode, normalizedSelectedType]);

  const isVideoMode = captureMode === "video" && allowVideoMode;
  const maxVideoDuration = normalizedSelectedType === "new moment" ? 60 : 30;
  const handleSelectedAsset = (asset) => {
    if (!asset) {
      return;
    }

    if (normalizedSelectedType === "new moment") {
      const normalized = {
        uri: asset.uri,
        filename:
          asset.fileName || asset.filename || asset.uri?.split("/").pop(),
        duration: asset.duration ?? 0,
        mediaType: asset.type || asset.mediaType || "video",
        id: asset.assetId || asset.id || Date.now().toString(),
        fromGallery: true,
      };
      setCapturedPhoto(normalized);
    } else {
      setCapturedPhoto(asset.uri || asset);
    }
  };

  const { ChooseImageFromGallery, ChooseVideoFromGallery } = useImageGallery({
    setSelectedImage: handleSelectedAsset,
  });

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (!allowVideoMode) {
      return;
    }

    if (!microphonePermission) {
      requestMicrophonePermission();
      return;
    }

    if (isVideoMode && !microphonePermission.granted) {
      requestMicrophonePermission();
    }
  }, [
    allowVideoMode,
    isVideoMode,
    microphonePermission,
    requestMicrophonePermission,
  ]);

  if (!permission) {
    return (
      <CameraNoPermission
        setCameraModalVisible={setCameraModalVisible}
        selectedType={selectedType}
      />
    );
  }

  if (!permission.granted) {
    return (
      <CameraNoPermission
        setCameraModalVisible={setCameraModalVisible}
        selectedType={selectedType}
      />
    );
  }

  const handleTakePicture = async () => {
    if (!camRef.current) {
      return;
    }

    try {
      const data = await camRef.current.takePictureAsync({
        quality: 0.85,
      });

      if (data?.uri) {
        if (typeof setCapturedPhoto === "function") {
          setCapturedPhoto(data.uri);
        }
        setCameraModalVisible(false);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };
  const toggleCameraFacing = () => {
    setFacing((current) =>
      current === CAMERA_TYPE.BACK ? CAMERA_TYPE.FRONT : CAMERA_TYPE.BACK
    );
  };

  const toggleFlash = () => {
    setFlashMode((current) =>
      current === FLASH_MODE.OFF ? FLASH_MODE.ON : FLASH_MODE.OFF
    );
  };

  const startVideoRecording = async () => {
    if (!isVideoMode || !camRef.current || isRecording) {
      return;
    }

    if (!microphonePermission?.granted) {
      const permissionResponse = await requestMicrophonePermission();
      if (!permissionResponse?.granted) {
        Alert.alert(
          "Permesso richiesto",
          "Per registrare un video devi consentire l'uso del microfono."
        );
        return;
      }
    }

    setIsRecording(true);

    try {
      const recording = await camRef.current.recordAsync({
        quality: "1080p",
        mute: false,
        maxDuration: maxVideoDuration,
      });

      if (recording?.uri && typeof setCapturedPhoto === "function") {
        const videoId = Date.now().toString();

        setCapturedPhoto({
          uri: recording.uri,
          id: "camera_" + videoId,
          duration: recording.duration ?? 0,
          filename: recording.uri.split("/").pop(),
          mediaType: "video",
          fromCamera: true,
        });
        setCameraModalVisible(false);
      }
    } catch (error) {
      console.error("Error recording video:", error);
      Alert.alert(
        "Registrazione non riuscita",
        error?.message || "Impossibile avviare la registrazione del video."
      );
    } finally {
      setIsRecording(false);
    }
  };

  const stopVideoRecording = async () => {
    if (!isRecording || !camRef.current) {
      return;
    }

    try {
      await camRef.current.stopRecording();
    } catch (error) {
      const message = String(error || "").toLowerCase();
      if (!message.includes("not recording")) {
        console.error("Error stopping video recording:", error);
        Alert.alert(
          "Interruzione non riuscita",
          error?.message || "Impossibile fermare la registrazione."
        );
      }
    }
  };

  const handleCapturePress = () => {
    if (isVideoMode) {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
      return;
    }

    if (isRecording) {
      return;
    }

    handleTakePicture();
  };
  const handleCloseModal = () => {
    if (isRecording) {
      stopVideoRecording();
      return;
    }

    setCameraModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {selectedType === "New post" && <View style={styles.shadowBowTop} />}
      <View
        style={
          !options
            ? styles.cameraStyle
            : selectedType === "New post"
            ? styles.cameraStyle
            : styles.cameraFullStyle
        }
      >
        <CameraView
          style={styles.camera}
          facing={facing}
          flash={flashMode}
          ref={camRef}
        />
      </View>

      {selectedType === "New post" && <View style={styles.shadowBowBottom} />}
      <View style={styles.shotButtonContainer}>
        <View
          style={[
            styles.shotButtonOutside,
            isRecording && styles.shotButtonOutsideRecording,
          ]}
        >
          <TouchableOpacity activeOpacity={0.8} onPress={handleCapturePress}>
            <View
              style={[
                styles.shotButtonInside,
                isRecording && styles.shotButtonInsideRecording,
              ]}
            />
          </TouchableOpacity>
        </View>
        {(allowPhotoMode || allowVideoMode) && (
          <View style={styles.captureModeSelector}>
            {allowPhotoMode && (
              <TouchableOpacity
                key="photo"
                style={[
                  styles.captureModeButton,
                  captureMode === "photo" && styles.captureModeButtonActive,
                ]}
                onPress={() => {
                  if (!isRecording) {
                    setCaptureMode("photo");
                  }
                }}
                disabled={captureMode === "photo"}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.captureModeLabel,
                    captureMode === "photo" && styles.captureModeLabelActive,
                  ]}
                >
                  Foto
                </Text>
              </TouchableOpacity>
            )}
            {allowVideoMode && (
              <TouchableOpacity
                key="video"
                style={[
                  styles.captureModeButton,
                  captureMode === "video" && styles.captureModeButtonActive,
                ]}
                onPress={() => {
                  if (!isRecording) {
                    setCaptureMode("video");
                  }
                }}
                disabled={captureMode === "video"}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.captureModeLabel,
                    captureMode === "video" && styles.captureModeLabelActive,
                  ]}
                >
                  Video
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <View
        style={[styles.mainContainer, options && styles.mainContainerCompact]}
      >
        <View
          style={[
            styles.titleContainer,
            {
              height: selectedType === "New post" ? 50 : 72,
              paddingTop: options ? 12 : 4,
            },
          ]}
        >
          <TouchableOpacity onPress={handleCloseModal}>
            <Ionicons name="close" size={34} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFlash}>
            <Ionicons
              name={flashMode === FLASH_MODE.ON ? "flash" : "flash-off-sharp"}
              size={34}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="ios-settings-sharp" size={34} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.iconContainer}>
          {!options && (
            <TouchableOpacity
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              disabled={isRecording}
              onPress={async () => {
                const asset =
                  normalizedSelectedType === "new moment"
                    ? await ChooseVideoFromGallery()
                    : await ChooseImageFromGallery();

                if (asset) {
                  setCameraModalVisible(false);
                }
              }}
            >
              <MaterialIcons name="photo-library" size={29} color="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            disabled={isRecording}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="reload-circle-outline" size={34} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CameraModule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  shadowBowTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SIZES.Height * 0.18,
    width: SIZES.Width,
    backgroundColor: "#000",
    opacity: 0.6,
    zIndex: -1,
  },
  shadowBowBottom: {
    position: "absolute",
    bottom: SIZES.Height * 0.16,
    left: 0,
    right: 0,
    height: SIZES.Height * 0.18,
    width: SIZES.Width,
    backgroundColor: "#000",
    opacity: 0.6,
    zIndex: -1,
  },
  camera: {
    flex: 1,
  },
  cameraStyle: {
    height: SIZES.Height * 0.82,
    width: SIZES.Width,
    position: "absolute",
    zIndex: -2,
    overflow: "hidden",
    borderRadius: 20,
  },
  cameraFullStyle: {
    marginTop: 50,
    height: SIZES.Height * 0.82,
    width: SIZES.Width,
    position: "absolute",
    zIndex: -2,
    overflow: "hidden",
    borderRadius: 20,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "space-between",
    marginHorizontal: 14,
    paddingTop: 6,
  },
  mainContainerCompact: {
    paddingTop: 18,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  iconContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginBottom: 15,
    alignItems: "flex-end",
  },
  shotButtonContainer: {
    left: 0,
    right: 0,
    top: SIZES.Height * 0.7,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    gap: 16,
  },
  shotButtonOutside: {
    height: 78,
    width: 78,
    backgroundColor: "transparent",
    borderRadius: 100,
    justifyContent: "center",
    borderColor: "#fff",
    borderWidth: 4,
    alignItems: "center",
    marginBottom: 18,
    zIndex: 1,
  },
  shotButtonInside: {
    height: 66,
    width: 66,
    backgroundColor: "#fff",
    borderRadius: 100,
  },
  shotButtonOutsideRecording: {
    borderColor: "#f44",
  },
  shotButtonInsideRecording: {
    backgroundColor: "#f33",
    transform: [{ scale: 0.75 }],
    borderRadius: 20,
  },
  captureModeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: 24,
  },
  captureModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  captureModeButtonActive: {
    backgroundColor: "#fff",
  },
  captureModeLabel: {
    color: "#f0f0f0",
    fontWeight: "700",
    letterSpacing: 0.4,
    fontSize: 13,
    textTransform: "uppercase",
  },
  captureModeLabelActive: {
    color: "#000",
  },
  modal: {
    flex: 1,
    backgroundColor: "#000",
  },
  uploadButton: {
    backgroundColor: "#333",
    minWidth: "90%",
    paddingVertical: "10%",
    marginBottom: "8%",
    borderRadius: 10,
    alignItems: "center",
  },
  uploadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
