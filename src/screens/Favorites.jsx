import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons, AntDesign, FontAwesome } from "@expo/vector-icons";
import { useUserContext } from "../contexts/UserContext";
import useFilterPosts from "../hooks/useFilterPosts";
import Posts from "../components/home/Posts";
import PostsSkeleton from "../components/home/skeletons/PostsSkeleton";
import { LinearGradient } from "expo-linear-gradient";

const Favorites = ({ navigation }) => {
  const { currentUser } = useUserContext();
  const [favoriteUsers, setFavoriteUsers] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Gestione sicura dei favorite_users
  useEffect(() => {
    if (currentUser) {
      const users = currentUser.favorite_users || [];
      setFavoriteUsers(Array.isArray(users) ? users : []);
    }
    setIsInitializing(false);
  }, [currentUser]);

  const { filteredPosts, isLoading, fetchOlderPosts, refreshPosts } =
    useFilterPosts(favoriteUsers);

  // Mostra loading durante l'inizializzazione
  if (isInitializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={28} color={"#fff"} />
          </TouchableOpacity>
          <Text style={styles.textTitle}>Favorites</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#09f" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Verifica se currentUser esiste
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={28} color={"#fff"} />
          </TouchableOpacity>
          <Text style={styles.textTitle}>Favorites</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>User not found</Text>
          <Text style={styles.emptyText}>
            Please login again to access your favorites.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.emptyButton}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderPostItem = ({ item }) => {
    return (
      <View key={item.id}>
        <Posts navigation={navigation} post={item} currentUser={currentUser} />
      </View>
    );
  };

  const ListFooterComponent = () => {
    return (
      <View style={styles.footerContainer}>
        <LinearGradient
          start={[0.9, 0.45]}
          end={[0.07, 1.03]}
          colors={["#ff00ff", "#ff4400", "#ffff00"]}
          style={styles.rainbowBorder}
        >
          <AntDesign name="checkcircle" size={58} color={"#000"} />
        </LinearGradient>
        <Text style={styles.title}>End of favorites</Text>
        <Text style={styles.text}>
          There are no more posts from favorites from the past 30 days.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.button}>Back to home</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const EmptyFavoritesComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <FontAwesome name="star-o" size={64} color={"#fff"} />
      </View>
      <Text style={styles.emptyTitle}>
        Choose the accounts you can't miss out on
      </Text>
      <Text style={styles.emptyText}>
        Add accounts to your favorites to see their posts here, starting
        with the most recent posts.
      </Text>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.emptyButton}>Back to home</Text>
      </TouchableOpacity>
    </View>
  );

  const LoadingComponent = () => (
    <View style={{ marginTop: 50 }}>
      <FlatList
        data={[1, 2, 3, 4]}
        renderItem={() => <PostsSkeleton />}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.titleContainer}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back-ios" size={28} color={"#fff"} />
        <Text style={styles.textTitle}>Favorites</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      {/* Caso 1: Nessun utente preferito configurato */}
      {favoriteUsers.length === 0 ? (
        <EmptyFavoritesComponent />
      ) : /* Caso 2: Caricamento iniziale */ isLoading && filteredPosts.length === 0 ? (
        <LoadingComponent />
      ) : /* Caso 3: Nessun post trovato dai favoriti */ filteredPosts.length === 0 ||
        (filteredPosts[0]?.id === "empty") ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <FontAwesome name="star-o" size={64} color={"#fff"} />
          </View>
          <Text style={styles.emptyTitle}>
            No recent posts from favorites
          </Text>
          <Text style={styles.emptyText}>
            Your favorite accounts haven't posted recently. Check back later or
            add more accounts to your favorites.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.emptyButton}>Back to home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Caso 4: Mostra i post dei favoriti */
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPostItem}
          scrollEventThrottle={16}
          onEndReached={() => fetchOlderPosts()}
          onEndReachedThreshold={0.5}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          onRefresh={() => refreshPosts()}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={ListFooterComponent}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
    </SafeAreaView>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 20,
    marginTop: Platform.OS === "android" ? 9 : 0,
    marginBottom: Platform.OS === "android" ? 14 : 10,
  },
  textTitle: {
    marginTop: 5,
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  divider: {
    height: 0.5,
    width: "100%",
    backgroundColor: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  footerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 60,
    gap: 10,
  },
  rainbowBorder: {
    padding: 3,
    height: 63.5,
    width: 63.5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  text: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    color: "#09f",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyContainer: {
    height: "75%",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 60,
    gap: 15,
  },
  emptyIcon: {
    borderWidth: 4,
    borderColor: "#fff",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    height: 94,
    width: 94,
  },
  emptyTitle: {
    textAlign: "center",
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
  },
  emptyButton: {
    color: "#09f",
    fontSize: 16,
    fontWeight: "700",
  },
});