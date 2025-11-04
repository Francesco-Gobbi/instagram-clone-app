import { StyleSheet, View, Text, TouchableWithoutFeedback } from "react-native";
import { useState } from "react";
import { COLORS } from "../../../utils/usePalete";
import useProfanityFilter from "../../../hooks/useProfanityFilter";

const Caption = ({ post }) => {
  const [showLongCaption, setShowLongCaption] = useState(false);
  const { filterText } = useProfanityFilter();
  const filteredCaption = filterText(post.caption);

  return (
    <View style={styles.caption}>
      {filteredCaption.length <= 0 ? null : filteredCaption.length < 82 ? (
        <Text style={styles.captionUser}>
          {post.username.toLowerCase() + " "}
          <Text style={styles.captionText}>{filteredCaption}</Text>
        </Text>
      ) : (
        <TouchableWithoutFeedback
          onPress={() => setShowLongCaption(!showLongCaption)}
        >
          <Text style={styles.captionUser}>
            {post.username.toLowerCase() + " "}

            {showLongCaption ? (
              <Text style={styles.captionText}>{filteredCaption}</Text>
            ) : (
              <Text style={styles.captionText}>
                {filteredCaption.slice(0, 74)}
                <Text style={styles.captionMore}>...more</Text>
              </Text>
            )}
          </Text>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

export default Caption;

const styles = StyleSheet.create({
  caption: {
    marginTop: 8,
    marginHorizontal: 12,
    flexDirection: "row",
  },
  captionUser: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 14,
  },
  captionText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontWeight: "400",
    fontSize: 14,
    marginLeft: 4,
  },
  captionMore: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
