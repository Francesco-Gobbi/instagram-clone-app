import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useMemo } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import CustomBackdrop from "../shared/bottomSheets/CustomBackdrop";
import { Ionicons, Feather, MaterialIcons, Octicons } from "@expo/vector-icons";
import useReportAction from "../../hooks/useReportAction";
import useSharePost from "../../hooks/useSharePost";

const BottomSheetOptionsReel = ({
  bottomSheetRef,
  navigation,
  reel,
  currentUser,
}) => {
  const { handleReportPost, ReportModalComponent } = useReportAction();
  const { sharePost } = useSharePost();
  const snapPoints = useMemo(() => [210], []);

  const handleShareReel = async () => {
    bottomSheetRef.current?.close();
    await sharePost(reel);
  };

  const handleAboutAccount = () => {
    bottomSheetRef.current?.close();
    if (currentUser.email === reel.owner_email) {
      navigation.navigate('Main Screen', { screen: 'Account' });
    } else {
      navigation.navigate('UserDetail', { email: reel.owner_email });
    }
  };

  return (
    <>
      <ReportModalComponent />
      <BottomSheetModal
        ref={bottomSheetRef}
        backgroundStyle={{ borderRadius: 25, backgroundColor: "#232325" }}
        backdropComponent={CustomBackdrop}
        handleComponent={() => (
          <View style={styles.closeLineContainer}>
            <View style={styles.closeLine}></View>
          </View>
        )}
        enablePanDownToClose
        index={0}
        snapPoints={snapPoints}
      >
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => handleShareReel()}
            style={styles.columnContainer}
          >
            <View style={styles.optionContainer}>
              <Feather name="send" size={24} color="#fff" />
              <Text style={styles.optionText}>Share</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => handleAboutAccount()}
            style={styles.columnContainer}
          >
            <View style={styles.optionContainer}>
              <Ionicons
                name="information-circle-outline"
                size={26}
                color="#fff"
              />
              <Text style={styles.optionText}>About this account</Text>
            </View>
          </TouchableOpacity>
          {reel.owner_email !== currentUser.email && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                onPress={() => {
                  handleReportPost(reel, currentUser);
                  bottomSheetRef.current?.close();
                }}
                style={styles.columnContainer}
              >
                <View style={styles.optionContainer}>
                  <Octicons name="report" size={22} color="#f00" />
                  <Text style={styles.optionRedText}>Report</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </BottomSheetModal>
    </>
  );
};

export default BottomSheetOptionsReel;

const styles = StyleSheet.create({
  closeLineContainer: {
    alignSelf: "center",
  },
  closeLine: {
    width: 40,
    height: 4,
    borderRadius: 5,
    backgroundColor: "#777",
    marginTop: 9,
    marginBottom: 20,
  },
  container: {
    flex: 1,
  },
  columnContainer: {
    marginTop: 6,
    marginHorizontal: 15,
    height: 44,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  optionRedText: {
    color: "#f00",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  divider: {
    height: 0.7,
    width: "100%",
    backgroundColor: "#444",
  },
});