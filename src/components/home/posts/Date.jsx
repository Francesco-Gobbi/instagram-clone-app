import { StyleSheet, Text, View } from "react-native";
import React from "react";
import useTimeAgo from "../../../utils/useTimeAgo";
import { COLORS } from "../../../utils/usePalete";

const Date = ({ post }) => {
  const { timeAgoLong } = useTimeAgo();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {post.createdAt && timeAgoLong(post.createdAt.seconds)}
      </Text>
    </View>
  );
};

export default Date;

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginHorizontal: 12,
    marginBottom: 2,
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "400",
  },
});
