import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import useImageGallery from "../hooks/useImageGallery";
import { SIZES } from "../constants";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import useMediaLibrary from "../hooks/useMediaLibrary";
import Animated from "react-native-reanimated";
import AlbumModal from "../components/mediaLibrary/AlbumModal";
import useAlbumSelector from "../utils/useAlbumSelector";
import useOpacityAnimation from "../utils/useOpacityAnimation";
import CameraModule from "../components/shared/CameraModule";
import { BlurView } from "expo-blur";
import blankPhoto from "../../assets/images/blank-image.png";
import MessageModal, {
  handleFeatureNotImplemented,
} from "../components/shared/modals/MessageModal";
import { darkTheme } from "../utils/theme";

const MediaLibrary = ({ navigation, route }) => {
  const { initialSelectedType, selectorAvailable = true } = route.params || {};
  const blankPhotoUri = Image.resolveAssetSource(blankPhoto).uri;
  const [selectedImage, setSelectedImage] = useState(blankPhotoUri);
  const [selectedType, setSelectedType] = useState(initialSelectedType ?? "New post");
  const [albumModalVisible, setAlbumModalVisible] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);

  const { scrollY, animatedStyle } = useOpacityAnimation();
  const { allAlbums, selectedAlbum, selectedAlbumTitle, handleAlbumSelection } =
    useAlbumSelector({ setAlbumModalVisible });
  const { images, videos, loading, error, refetchMedia } = useMediaLibrary(selectedAlbum, selectedType);

  const setCapturedPhoto = (photo) => {
    const uri = typeof photo === "string" ? photo : photo?.uri;

    if (!uri) {
      return;
    }

    const payload =
      typeof photo === "object" && photo !== null
        ? { ...photo, uri }
        : { uri };

    if (!payload.id) {
      payload.id = Date.now().toString();
    }

    if (typeof payload.duration !== "number") {
      payload.duration = 0;
    }

    if (selectedType === "New Moment") {
      if (!payload.mediaType) {
        payload.mediaType = "video";
      }

      const mediaType = typeof payload.mediaType === "string" ? payload.mediaType.toLowerCase() : "";
      const normalizedUri = typeof uri === "string" ? uri.split("?")[0].toLowerCase() : "";
      const hasVideoMime = mediaType.includes("video");
      const hasVideoExtension =
        normalizedUri.endsWith(".mp4") ||
        normalizedUri.endsWith(".mov") ||
        normalizedUri.endsWith(".m4v") ||
        normalizedUri.endsWith(".avi") ||
        normalizedUri.endsWith(".webm") ||
        normalizedUri.endsWith(".mkv");
      const hasDuration = typeof payload.duration === "number" && payload.duration > 0;

      if (!hasVideoMime && !hasVideoExtension && !hasDuration) {
        Alert.alert(
          "Seleziona un video",
          "Per creare un Moment devi scegliere o registrare un video."
        );
        return;
      }
    }
    if (selectedType === "New post") {
      setSelectedImage(uri);
    } else if (selectedType === "Add to story") {
      navigation.navigate("NewStory", { selectedImage: payload });
    } 
    // else if (selectedType === "New Moment") {
    //   navigation.navigate("NewMoment", { selectedImage: payload });
    // }
  };

  const {
    ChooseImageFromGallery: openImagePicker,
    ChooseVideoFromGallery: openVideoPicker,
  } = useImageGallery({
    setSelectedImage: setCapturedPhoto,
  });

  const [selectorVisible, setSelectorVisible] = useState(true);

  const handleScroll = (event) => {
    scrollY.value = event.nativeEvent.contentOffset.y;

    if (event.nativeEvent.contentOffset.y < 900) {
      setSelectorVisible(true);
    } else {
      setSelectorVisible(false);
    }
  };

  useEffect(() => {
    if (selectedType === "New post") {
      if (images.length > 0) {
        setSelectedImage(images[0].uri);
      } else {
        setSelectedImage(blankPhotoUri);
      }
    } else {
      setSelectedImage(blankPhotoUri);
    }
  }, [images, selectedType]);


  const handleImageSelection = (image) => {
    setSelectedImage(image.uri);
  };

  const handleTypeSelector = (type) => {
    if (type === selectedType) {
      return;
    }

    setSelectedType(type);
  };

  const handleNextButton = () => {
    navigation.navigate("NewPost", { selectedImage });
  };

  const handleAlbumTitlePress = async () => {
    const openPicker = selectedType === "New Moment" ? openVideoPicker : openImagePicker;

    if (selectedAlbumTitle === "Recents") {
      await openPicker();
      return;
    }

    if (!allAlbums || allAlbums.length === 0) {
      await openPicker();
      return;
    }

    setAlbumModalVisible(true);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={{ flex: 1 }}>
        {selectedType === "New post" ? (
          <TouchableOpacity onPress={() => handleImageSelection(item)}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.uri }} style={styles.image} />
            </View>
          </TouchableOpacity>
        ) : selectedType === "Add to story" ? (
          <TouchableOpacity
            key={item.id}
            onPress={() =>
              navigation.navigate("NewStory", { selectedImage: item })
            }
          >
            <View style={styles.videoContainer}>
              {Platform.OS === "ios" ? (
                <Animated.Image
                  source={{ uri: item.uri }}
                  style={styles.image}
                  sharedTransitionTag={item.id.toString()}
                />
              ) : (
                <Image source={{ uri: item.uri }} style={styles.image} />
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={item.id}
            onPress={() =>
              navigation.navigate("NewMoment", { selectedImage: item })
            }
          >
            <View style={styles.videoContainer}>
              {Platform.OS === "ios" ? (
                <Animated.Image
                  source={{ uri: item.uri }}
                  style={styles.image}
                  sharedTransitionTag={item.id.toString()}
                />
              ) : (
                <Animated.Image
                  source={{ uri: item.uri }}
                  style={styles.image}
                />
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 50 }}
        >
          <MaterialIcons
            name="close"
            size={32}
            color={darkTheme.colors.textPrimary}
            style={styles.iconCorrection}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>{selectedType}</Text>
        <View style={{ width: 50, alignItems: "flex-end" }}>
          {selectedType === "New post" ? (
            selectedImage !== blankPhotoUri && !loading ? (
              <TouchableOpacity onPress={handleNextButton}>
                <Text style={styles.nextButton}>Next</Text>
              </TouchableOpacity>
            ) : (
              <ActivityIndicator color={darkTheme.colors.textSecondary} size="small" />
            )
          ) : (<></>)}
        </View>
      </View>
      <View style={styles.mediaContainer}>
        {selectedType === "New post" ? (
          <View style={styles.selectedImageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
            />
          </View>
        ) : selectedType === "Add to story" ? null : null}
        <View style={styles.LibraryBarContainer}>
          <View style={styles.albunButtonContainer}>
            <TouchableOpacity onPress={handleAlbumTitlePress}>
              <Text style={styles.albunButtonText}>{selectedAlbumTitle}</Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color={darkTheme.colors.textPrimary}
                style={styles.albunButtonIcon}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setCameraModalVisible(true)}>
            <View style={styles.cameraButtonContainer}>
              <Feather name="camera" size={17} color={darkTheme.colors.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>
        {/* <FlatList
          key={selectedType}
          data={selectedType === "New Moment" ? videos : images}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id.toString()}
          numColumns={selectedType === "New post" ? 4 : 3}
          onScroll={handleScroll}
          refreshing={loading}
          onRefresh={refetchMedia}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  {error
                    ? "Impossibile caricare i media. Controlla i permessi."
                    : "Nessun contenuto disponibile"}
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            selectedType === "New post"
              ? undefined
              : { paddingBottom: 40 }
          }
        /> */}

        {selectorAvailable && selectorVisible && (
          <Animated.View style={animatedStyle}>
            <BlurView
              intensity={30}
              tint="light"
              style={styles.selectorContainer}
            >
              <TouchableOpacity onPress={() => handleTypeSelector("New post")}>
                <Text
                  style={[
                    styles.selectorButton,
                    { color: selectedType === "New post" ? darkTheme.colors.textPrimary : darkTheme.colors.textSecondary },
                  ]}
                >
                  POST
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTypeSelector("Add to story")}
              >
                <Text
                  style={[
                    styles.selectorButton,
                    {
                      color: selectedType === "Add to story" ? darkTheme.colors.textPrimary : darkTheme.colors.textSecondary,
                    },
                  ]}
                >
                  STORY
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => handleTypeSelector("New Moment")}>
                <Text
                  style={[
                    styles.selectorButton,
                    { color: selectedType === "New Moment" ? darkTheme.colors.textPrimary : darkTheme.colors.textSecondary },
                  ]}
                >
                  MOMENT
                </Text>
              </TouchableOpacity> */}
            </BlurView>
          </Animated.View>
        )}
        <MessageModal
          messageModalVisible={messageModalVisible}
          message={"This feature is not yet implemented."}
        />
      </View>
      <Modal
        animationType="slide"
        transparent={false}
        visible={albumModalVisible}
      >
        <AlbumModal
          setAlbumModalVisible={setAlbumModalVisible}
          handleAlbumSelection={handleAlbumSelection}
          allAlbums={allAlbums}
        />
      </Modal>
      <Modal
        animationType="slide"
        transparent={false}
        visible={cameraModalVisible}
      >
        <CameraModule
          setCameraModalVisible={setCameraModalVisible}
          setCapturedPhoto={setCapturedPhoto}
          setSelectedType={setSelectedType}
          selectedType={selectedType}
          options={true}
        />
      </Modal>
    </View>
  );
};

export default MediaLibrary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 40,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: Platform.OS === "android" ? 15 : 10,
    height: 45,
  },
  headerText: {
    color: darkTheme.colors.textPrimary,
    fontWeight: "800",
    fontSize: 17,
    marginBottom: 2,
  },
  nextButton: {
    color: darkTheme.colors.accent,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 2,
  },
  mediaContainer: {
    flex: 1,
  },
  selectedImageContainer: {
    height: SIZES.Width,
    width: SIZES.Width,
  },
  selectedImage: {
    flex: 1,
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 10,
  },
  LibraryBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    height: 46,
  },
  albunButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  albunButtonText: {
    color: darkTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  albunButtonIconWrapper: {
    paddingTop: 3,
    marginLeft: 6,
  },
  albunButtonIcon: {
    marginLeft: 0,
  },
  cameraButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    backgroundColor: darkTheme.colors.surface,
    borderWidth: 0.5,
    borderColor: darkTheme.colors.outline,
    height: 30,
    width: 30,
  },
  imageContainer: {
    flex: 1,
    margin: 0.3,
    aspectRatio: 1,
    overflow: "hidden",
  },
  videoContainer: {
    flex: 1,
    margin: 0.3,
    aspectRatio: 9 / 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  selectorContainer: {
    position: "absolute",
    bottom: 35,
    right: 15,
    height: 48,
    width: 240,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(12, 18, 52, 0.88)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  selectorButton: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    color: darkTheme.colors.textSecondary,
    fontSize: 14,
  },
});
