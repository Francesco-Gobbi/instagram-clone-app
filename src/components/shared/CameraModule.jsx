import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SIZES } from "../../constants";
import CameraNoPermission from "./CameraNoPermission";
import useImageGallery from "../../hooks/useImageGallery";

// Costanti sicure per la camera
const CAMERA_TYPE = {
  BACK: 'back',
  FRONT: 'front'
};

const FLASH_MODE = {
  OFF: 'off',
  ON: 'on',
  AUTO: 'auto'
};

const CAPTURE_MODE = {
  PHOTO: 'photo',
  VIDEO: 'video',
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
  const [isCameraReady, setIsCameraReady] = useState(false);
  const skipNextPressRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [captureMode, setCaptureMode] = useState(() =>
    selectedType === "New reel" ? CAPTURE_MODE.VIDEO : CAPTURE_MODE.PHOTO
  );

  const isVideoMode = captureMode === CAPTURE_MODE.VIDEO;
  const allowVideoCapture = selectedType === "New reel";
  const canRecordVideo = allowVideoCapture && isVideoMode;
  const maxVideoDuration = canRecordVideo ? 60 : 0;

  const handleSelectedAsset = (asset) => {
    if (!asset) {
      return;
    }

    if (selectedType === "New reel") {
      const normalized = {
        uri: asset.uri,
        filename: asset.fileName || asset.filename || asset.uri?.split("/").pop(),
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

  const {
    ChooseImageFromGallery,
    ChooseVideoFromGallery,
  } = useImageGallery({
    setSelectedImage: handleSelectedAsset,
  });
  useEffect(() => {
    setIsCameraReady(false);
  }, [selectedType]);

  useEffect(() => {
    setCaptureMode(selectedType === "New reel" ? CAPTURE_MODE.VIDEO : CAPTURE_MODE.PHOTO);
  }, [selectedType]);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

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
    if (!isCameraReady) {
      Alert.alert("Fotocamera non pronta", "Attendi che la fotocamera completi l'avvio prima di scattare.");
      return;
    }

    if (!camRef.current) {
      return;
    }

    try {
      const data = await camRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
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
    setIsCameraReady(false);
    setFacing(current =>
      current === CAMERA_TYPE.BACK ? CAMERA_TYPE.FRONT : CAMERA_TYPE.BACK
    );
  };

  const toggleFlash = () => {
    setFlashMode(current =>
      current === FLASH_MODE.OFF ? FLASH_MODE.ON : FLASH_MODE.OFF
    );
  };

  const startVideoRecording = () => {
    if (!canRecordVideo || !camRef.current || isRecording) {
      return false;
    }

    if (!isCameraReady) {
      Alert.alert(
        "Fotocamera non pronta",
        "Attendi che la fotocamera completi l'avvio prima di registrare."
      );
      return false;
    }

    setIsRecording(true);
    skipNextPressRef.current = true;

    const recordOptions = {
      quality: '1080p',
      mute: false,
    };

    if (maxVideoDuration) {
      recordOptions.maxDuration = maxVideoDuration;
    }

    camRef.current
      .recordAsync(recordOptions)
      .then((video) => {
        if (video?.uri && typeof setCapturedPhoto === 'function') {
          const videoId = Date.now().toString();

          setCapturedPhoto({
            uri: video.uri,
            id: 'camera_' + videoId,
            duration: video.duration ?? 0,
            filename: video.uri.split('/').pop(),
            mediaType: 'video',
            fromCamera: true,
          });
          setCameraModalVisible(false);
        }
      })
      .catch((error) => {
        console.error('Error recording video:', error);
        Alert.alert(
          'Registrazione non riuscita',
          error?.message || 'Impossibile avviare la registrazione del video.'
        );
      })
      .finally(() => {
        setIsRecording(false);
        skipNextPressRef.current = false;
      });

    return true;
  };

  const stopVideoRecording = async () => {
    if (!isRecording || !camRef.current) {
      return;
    }

    try {
      await camRef.current.stopRecording();
    } catch (error) {
      const message = String(error || '').toLowerCase();
      if (!message.includes('not recording')) {
        console.error('Error stopping video recording:', error);
        Alert.alert(
          'Interruzione non riuscita',
          error?.message || 'Impossibile fermare la registrazione.'
        );
      } else {
        console.warn('Stop recording called too early:', error);
      }
    } finally {
      setIsRecording(false);
      skipNextPressRef.current = false;
    }
  };


  const handleCapturePress = () => {
    if (canRecordVideo) {
      if (!isCameraReady) {
        Alert.alert(
          "Fotocamera non pronta",
          "Attendi che la fotocamera completi l'avvio prima di registrare."
        );
        return;
      }

      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
      return;
    }

    if (isVideoMode && !allowVideoCapture) {
      Alert.alert(
        "Video non disponibile",
        "Passa alla modalità Reel per registrare un video."
      );
      return;
    }

    if (isRecording || skipNextPressRef.current) {
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
          onCameraReady={() => setIsCameraReady(true)}
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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCapturePress}
          >
            <View
              style={[
                styles.shotButtonInside,
                isRecording && styles.shotButtonInsideRecording,
              ]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.modeSelectorContainer}>
          {[CAPTURE_MODE.PHOTO, CAPTURE_MODE.VIDEO].map((mode) => {
            const isActive = captureMode === mode;
            const isVideoOption = mode === CAPTURE_MODE.VIDEO;
            const disabled = isVideoOption && !allowVideoCapture;
            const label = mode === CAPTURE_MODE.PHOTO ? "FOTO" : "VIDEO";

            return (
              <TouchableOpacity
                key={mode}
                activeOpacity={disabled ? 1 : 0.8}
                onPress={() => {
                  if (disabled) {
                    Alert.alert(
                      "Modalita non disponibile",
                      "Per registrare un video seleziona prima l'opzione Reel."
                    );
                    return;
                  }
                  setCaptureMode(mode);
                }}
                style={[
                  styles.modeOption,
                  isActive && styles.modeOptionActive,
                  disabled && styles.modeOptionDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.modeOptionText,
                    isActive && styles.modeOptionTextActive,
                    disabled && styles.modeOptionTextDisabled,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.mainContainer}>
        <View
          style={[
            styles.titleContainer,
            { height: selectedType === "New post" ? 50 : 72 },
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
          <TouchableOpacity
            onPress={async () => {
              const asset = selectedType === "New reel"
                ? await ChooseVideoFromGallery()
                : await ChooseImageFromGallery();

              if (asset) {
                setCameraModalVisible(false);
              }
            }}
          >
            <MaterialIcons name="photo-library" size={29} color="#fff" />
          </TouchableOpacity>

          {options && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity onPress={() => setSelectedType("New post")}>
                <Text
                  style={
                    selectedType === "New post"
                      ? styles.optionsSelectedText
                      : styles.optionText
                  }
                >
                  POST
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedType("Add to story")}>
                <Text
                  style={
                    selectedType === "Add to story"
                      ? styles.optionsSelectedText
                      : styles.optionText
                  }
                >
                  STORY
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedType("New reel")}>
                <Text
                  style={
                    selectedType === "New reel"
                      ? styles.optionsSelectedText
                      : styles.optionText
                  }
                >
                  REEL
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={toggleCameraFacing}>
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
    marginBottom: SIZES.Width * 0.19,
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
  modeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 28,
  },
  modeOption: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  modeOptionActive: {
    backgroundColor: "#fff",
  },
  modeOptionDisabled: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  modeOptionText: {
    color: "#bbb",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  modeOptionTextActive: {
    color: "#000",
  },
  modeOptionTextDisabled: {
    color: "#555",
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
  optionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  optionText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  optionsSelectedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    alignSelf: "center",
  },
});


















