import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../../../utils/usePalete";

const Likes = ({ post, navigation }) => (
  <View>
    {post.likes_by_users.length < 1 ? null : post.likes_by_users.length == 1 ? (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Likes", {
            likesByEmail: post.likes_by_users,
          })
        }
      >
        <Text style={styles.likesText}>1 like</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Likes", {
            likesByEmail: post.likes_by_users,
          })
        }
      >
        <Text style={styles.likesText}>
          <Text style={styles.likesText}>
            {post.likes_by_users.length.toLocaleString("es-ar")} likes
          </Text>
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

export default Likes;

const styles = StyleSheet.create({
  likesText: {
    marginHorizontal: 12,
    marginTop: 5,
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 13,
  },
});
