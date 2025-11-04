import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import React, { useCallback } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomBackdrop from "../shared/bottomSheets/CustomBackdrop";
import useReportAction from "../../hooks/useReportAction";
import useBlockUser from "../../hooks/useBlockUser";
import useSharePost from "../../hooks/useSharePost";
import useDeletePost from "../../hooks/useDeletePost";

const BottomSheetOptions = ({
  bottomSheetRef,
  story,
  handleResume,
  navigation,
  currentUser,
}) => {
  const { shareStory } = useSharePost();
  const { deleteStory } = useDeletePost();
  const { handleReportPost, ReportModalComponent } = useReportAction();
  const { handleBlockUser } = useBlockUser();

  const handleDeleteStory = useCallback(() => {
    Alert.alert("Delete Story", "Are you sure you want to delete this story?", [
      {
        text: "Cancel",
        onPress: () => {
          bottomSheetRef.current?.dismiss();
          handleResume();
        },
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteStory(story);
            bottomSheetRef.current?.dismiss();
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting story:", error);
            Alert.alert("Error", "Failed to delete story");
          }
        },
        style: "destructive",
      },
    ]);
  }, [story, navigation, bottomSheetRef, deleteStory, handleResume]);

  const handleShareStory = useCallback(async () => {
    try {
      await shareStory(story);
      bottomSheetRef.current?.dismiss();
      handleResume();
    } catch (error) {
      console.error("Error sharing story:", error);
      Alert.alert("Error", "Failed to share story");
    }
  }, [story, bottomSheetRef, shareStory, handleResume]);

  const handleBlock = useCallback(() => {
    if (!story?.owner_email) {
      Alert.alert("Error", "Cannot block user - missing email");
      return;
    }

    Alert.alert(
      "Block User",
      "Are you sure you want to block this user? You won't see their content anymore.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            bottomSheetRef.current?.dismiss();
            handleResume();
          },
        },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              await handleBlockUser(story.owner_email);
              bottomSheetRef.current?.dismiss();
              navigation.goBack();
            } catch (error) {
              console.error("Error blocking user:", error);
              Alert.alert("Error", "Failed to block user");
            }
          },
        },
      ]
    );
  }, [story, navigation, bottomSheetRef, handleBlockUser, handleResume]);

  const handleReport = useCallback(async () => {
    try {
      await handleReportPost(story, currentUser);
      bottomSheetRef.current?.dismiss();
      handleResume();
      Alert.alert("Thank you", "Your report has been submitted");
    } catch (error) {
      console.error("Error reporting story:", error);
      Alert.alert("Error", "Failed to submit report");
    }
  }, [story, currentUser, bottomSheetRef, handleReportPost, handleResume]);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    handleResume();
  }, [bottomSheetRef, handleResume]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      backgroundStyle={{ borderRadius: 25, backgroundColor: "#232325" }}
      backdropComponent={CustomBackdrop}
      handleComponent={() => <View style={styles.closeLine} />}
      enablePanDownToClose
      detached={true}
      bottomInset={24}
      index={0}
      onChange={(index) => {
        if (index === -1) handleResume();
      }}
      snapPoints={["40%"]}
      style={styles.sheetContainer}
    >
      <View style={styles.container}>
        <ReportModalComponent />

        <TouchableOpacity onPress={handleReport} style={styles.rowContainer}>
          <Text style={styles.redText}>Report</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity onPress={handleBlock} style={styles.rowContainer}>
          <Text style={styles.redText}>Block</Text>
        </TouchableOpacity>

        {story?.owner_email === currentUser?.email && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              onPress={handleDeleteStory}
              style={styles.rowContainer}
            >
              <Text style={styles.redText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={handleShareStory}
          style={styles.rowContainer}
        >
          <Text style={styles.text}>Share</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity onPress={handleClose} style={styles.rowContainer}>
          <Text style={styles.text}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: 15,
  },
  container: {
    flex: 1,
  },
  closeLine: {
    width: 40,
    height: 4,
    borderRadius: 5,
    backgroundColor: "#777",
    marginTop: 9,
    marginBottom: 20,
    alignSelf: "center",
  },
  divider: {
    height: 0.4,
    width: "100%",
    backgroundColor: "#777",
  },
  rowContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  redText: {
    color: "#f00",
    fontSize: 16,
    fontWeight: "400",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
  },
});

export default BottomSheetOptions;
