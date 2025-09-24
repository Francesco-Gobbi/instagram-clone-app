import React, { useState } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Divider } from "react-native-elements";
import { useUserContext } from "../contexts/UserContext";
import ProfilePicture from "../components/profile/edit/ProfilePicture";
import useUploadPicture from "../hooks/useUploadPicture";
import useUploadProfilePicture from "../hooks/useUploadProfilePicture";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";

const EditProfile = ({ navigation }) => {
  const { currentUser } = useUserContext();
  const { uploadPicture, uploading } = useUploadPicture();
  const { uploadProfilePicture, loader } = useUploadProfilePicture();
  const [previewImage, setPreviewImage] = useState(null);
  const [pictureOptionsVisible, setPictureOptionsVisible] = useState(false);

  const childPropChange = (newImage) => {
    setPreviewImage(newImage);
  };

  const handleUploadPicture = async () => {
    if (!previewImage) {
      return;
    }

    const uploadedImageUri = await uploadPicture(
      previewImage,
      currentUser?.email,
      "profile_picture"
    );
    await uploadProfilePicture(uploadedImageUri, currentUser?.email);
    setPreviewImage(null);
  };

  const handlePictureModal = () => {
    setPictureOptionsVisible(true);
  };

  const renderGender = () => {
    const gender = currentUser?.gender;
    if (Array.isArray(gender) && gender.length > 0) {
      return gender[0] === "Custom" ? gender[1] || "Custom" : gender[0];
    }
    if (typeof gender === "string" && gender.length > 0) {
      return gender;
    }
    return "Gender";
  };

  const safeName = currentUser?.name || "Name";
  const safeBio = currentUser?.bio || "Bio";
  const safeUsername = currentUser?.username || "Username";
  const safeLink = currentUser?.link || "Add a Link";
  const hasName = Boolean(currentUser?.name);
  const hasBio = Boolean(currentUser?.bio);
  const hasLink = Boolean(currentUser?.link);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.textTitle}>Edit profile</Text>
        {uploading || loader ? (
          <ActivityIndicator style={styles.activityIndicator} />
        ) : previewImage ? (
          <TouchableOpacity
            onPress={async () => {
              await handleUploadPicture();
              navigation.goBack();
            }}
          >
            <Text style={styles.doneBtn}>Done</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.doneDisabled}>Done</Text>
        )}
      </View>
      <Divider width={0.4} color={"#222"} />
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={handlePictureModal}>
          <Image
            source={{
              uri: previewImage ? previewImage : currentUser?.profile_picture,
            }}
            style={styles.image}
          />
          <Text style={styles.imageText}>Edit picture</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Divider width={0.4} color={"#222"} />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditingProfile", { module: "Name" })
          }
          style={styles.rowContainer}
        >
          <Text style={styles.descriptiveText}>Name</Text>
          <Text
            style={hasName ? styles.editableText : styles.editableBlurText}
          >
            {hasName ? safeName : "Name"}
          </Text>
        </TouchableOpacity>
        <Divider width={0.4} color={"#222"} />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditingProfile", { module: "Username" })
          }
          style={styles.rowContainer}
        >
          <Text style={styles.descriptiveText}>Username</Text>
          <Text style={styles.editableText}>{safeUsername}</Text>
        </TouchableOpacity>
        <Divider width={0.4} color={"#222"} />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditingProfile", { module: "Bio" })
          }
          style={styles.rowContainer}
        >
          <Text style={styles.descriptiveText}>Bio</Text>
          <Text
            style={hasBio ? styles.editableText : styles.editableBlurText}
          >
            {hasBio ? safeBio : "Bio"}
          </Text>
        </TouchableOpacity>
        <Divider width={0.4} color={"#222"} />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditingProfile", { module: "Link" })
          }
          style={styles.rowContainer}
        >
          <Text style={styles.descriptiveText}>Link</Text>
          <Text
            numberOfLines={1}
            style={hasLink ? styles.editableText : styles.editableBlurText}
          >
            {hasLink ? safeLink : "Add a Link"}
          </Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
        </TouchableOpacity>
        <Divider width={0.4} color={"#222"} />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditingProfile", { module: "Gender" })
          }
          style={styles.rowContainer}
        >
          <Text style={styles.descriptiveText}>Gender</Text>
          <Text style={styles.editableText}>{renderGender()}</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#999" />
        </TouchableOpacity>
        <Divider width={0.4} color={"#222"} />
      </View>
      <ProfilePicture
        visible={pictureOptionsVisible}
        onClose={() => setPictureOptionsVisible(false)}
        currentUser={currentUser}
        onPropChange={childPropChange}
      />
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  titleContainer: {
    marginHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
  },
  textTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  doneBtn: {
    fontSize: 16,
    fontWeight: "700",
    color: "#19f",
  },
  doneDisabled: {
    fontSize: 16,
    fontWeight: "700",
    color: "#555",
  },
  activityIndicator: {
    alignSelf: "center",
    marginHorizontal: 15,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: Platform.OS === "android" ? 20 : 16,
  },
  image: {
    height: 90,
    width: 90,
    contentFit: "cover",
    borderRadius: 100,
  },
  imageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#09f",
    marginTop: 16,
    paddingLeft: 7,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
  },
  descriptiveText: {
    color: "#fff",
    minWidth: Platform.OS === "android" ? 110 : 100,
    marginVertical: 15,
    fontSize: 16,
  },
  editableText: {
    color: "#fff",
    minWidth: 96,
    marginVertical: 15,
    fontSize: 16,
    flex: 1,
  },
  editableBlurText: {
    color: "#444",
    minWidth: 96,
    marginVertical: 15,
    fontSize: 16,
    flex: 1,
  },
});
