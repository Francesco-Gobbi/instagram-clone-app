import { Alert } from "react-native";
import firebase from "../services/firebase";
import React, { useState } from "react";
import ReportModal from "../components/shared/modals/ReportModal";

const useReportAction = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [reportData, setReportData] = useState(null);

  const reportPost = (post, currentUser, reason) => {
    try {
      firebase.firestore().collection("reports").add({
        ...post,
        reported_by: currentUser.email,
        reason: reason,
        type: "post",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert(
        "Thanks for reporting this",
        "We'll review the post to determine whether it violates our policies. Thanks for helping us keep ShentaoHub safe."
      );
    } catch (error) {
      console.log(error);
    }
  };

  const reportUser = (user, currentUser, reason) => {
    try {
      firebase.firestore().collection("reports").add({
        user,
        reported_by: currentUser.email,
        reason: reason,
        type: "user",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert(
        "Thanks for reporting this",
        "We'll review the user to determine whether it violates our policies. Thanks for helping us keep ShentaoHub safe."
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleReportPost = (post, currentUser) => {
    setReportData({ type: "post", data: post, user: currentUser });
    setModalVisible(true);
  };

  const handleReportUser = (user, currentUser) => {
    setReportData({ type: "user", data: user, user: currentUser });
    setModalVisible(true);
  };

  const submitReport = (reason) => {
    if (reportData.type === "post") {
      reportPost(reportData.data, reportData.user, reason);
    } else {
      reportUser(reportData.data, reportData.user, reason);
    }
  };

  const ReportModalComponent = () => (
    <ReportModal
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
      onSubmit={submitReport}
    />
  );

  return {
    handleReportPost,
    handleReportUser,
    ReportModalComponent,
  };
};

export default useReportAction;
