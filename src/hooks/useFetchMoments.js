import { useState, useEffect, useRef } from 'react'
import firebase from "../services/firebase";
import { useUserContext } from "../contexts/UserContext";

const toMillis = (timestamp) => {
  if (!timestamp) return 0;
  if (typeof timestamp === 'number') return timestamp;
  if (typeof timestamp?.toMillis === 'function') return timestamp.toMillis();
  if (typeof timestamp?.seconds === 'number') return timestamp.seconds * 1000;
  return 0;
};

const normalizeVideo = (doc) => {
  const data = doc.data() || {};
  return {
    id: doc.id,
    videoUrl: data.videoUrl || data.uri || '',
    caption: data.caption || '',
    profile_picture: data.profile_picture || data.owner_profile_picture || '',
    username: data.username || data.owner_username || '',
    name: data.name || data.owner_name || '',
    owner_email: data.owner_email || data.email || '',
    createdAt: data.createdAt || null,
    likes_by_users: Array.isArray(data.likes_by_users) ? data.likes_by_users : [],
    comments: Array.isArray(data.comments) ? data.comments : [],
    shared: typeof data.shared === 'number' ? data.shared : 0,
    ...data,
  };
};

const useFetchMoments = () => {
  const { currentUser } = useUserContext();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const refreshKeyRef = useRef(0);

  // listen to current user doc for blocked/hidden lists
  useEffect(() => {
    if (!currentUser?.email) return;
    const userRef = firebase.firestore().collection('users').doc(currentUser.email);
    const unsubUser = userRef.onSnapshot((doc) => {
      const data = doc.data() || {};
      setBlockedUsers(data.blockedUsers || []);
    }, (err) => {
      console.error('Error listening user doc for moments:', err);
    });

    return () => unsubUser && unsubUser();
  }, [currentUser?.email]);

  useEffect(() => {
    if (!currentUser?.email) return;
    setLoading(true);

    const unsubscribe = firebase
      .firestore()
      .collectionGroup('reels')
      .onSnapshot(
        (snapshot) => {
          try {
            const vids = snapshot.docs
              .map(normalizeVideo)
              .filter(video => {
                // filter blocked users
                if (blockedUsers && blockedUsers.includes(video.owner_email)) return false;
                // filter hidden moments if user has hiddenMoments
                if (currentUser && currentUser.hiddenMoments && currentUser.hiddenMoments.includes(video.id)) return false;
                if (video.blockedBy && Array.isArray(video.blockedBy) && video.blockedBy.includes(currentUser?.owner_uid)) return false;
                return true;
              })
              .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

            setVideos(vids);
          } catch (error) {
            console.error('Error processing reels:', error);
            setVideos([]);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error fetching reels:', error);
          setVideos([]);
          setLoading(false);
        }
      );

    return () => unsubscribe && unsubscribe();
  }, [currentUser?.email, blockedUsers, refreshKeyRef.current]);

  const refreshMoments = () => {
    // bump key to re-run effect
    refreshKeyRef.current = (refreshKeyRef.current || 0) + 1;
    // also set loading to true briefly
    setLoading(true);
  };

  return {
    videos,
    loading,
    refreshMoments,
  };
};

export default useFetchMoments;
