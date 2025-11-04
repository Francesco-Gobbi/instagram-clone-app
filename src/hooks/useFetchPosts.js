import { useEffect, useState } from "react";
import firebase from "../services/firebase";
import { useUserContext } from "../contexts/UserContext";

const useFetchPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loadLimit, setLoadLimit] = useState(40);
    const [isLoading, setIsLoading] = useState(false);
    const [justRequested, setJustRequested] = useState(false);
    const { currentUser } = useUserContext();

useEffect(() => {
    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const unsubscribe = firebase
              .firestore()
              .collectionGroup("posts")
              .orderBy("createdAt", "desc")
              .limit(loadLimit)
              .onSnapshot(snapshot => {
                  if (snapshot && snapshot.docs) {
                      const updatedPosts = snapshot.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }))
                                            .filter(post => {
                                                // Nascondi post di utenti bloccati
                                                if (currentUser && currentUser.blockedUsers && currentUser.blockedUsers.includes(post.owner_email)) {
                                                    return false;
                                                }
                                                // Nascondi post segnalati/bloccati
                                                if (currentUser && currentUser.hiddenPosts && currentUser.hiddenPosts.includes(post.id)) {
                                                    return false;
                                                }
                                                // Nascondi post che hanno blockedBy con l'id dell'utente corrente
                                                                        if (post.blockedBy && Array.isArray(post.blockedBy) && post.blockedBy.includes(currentUser.owner_uid)) {
                                                    return false;
                                                }
                                                return true;
                                            });
                      setPosts(updatedPosts || []);
                  } else {
                      setPosts([]);
                  }
            }, error => {
                console.error("Error in snapshot listener:", error);
                setPosts([]);
            });

            return () => unsubscribe;
        } catch (error) {
            console.error("Error fetching posts:", error);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
      }
    fetchPosts();
}, [loadLimit, currentUser]);

    const fetchOlderPosts = () => {
        if (!justRequested) {
            setJustRequested(true);
            setTimeout(() => {
                setJustRequested(false);
            }, 5000)
            setLoadLimit(loadLimit + 20);
        }
    };

    const refreshPosts = async () => {
        if (!justRequested) {
            setJustRequested(true);
            setTimeout(() => {
                setJustRequested(false);
            }, 5000)
            setLoadLimit(20);
        }
    };

    return {
        posts,
        isLoading,
        fetchOlderPosts,
        refreshPosts
    };
};

export default useFetchPosts;