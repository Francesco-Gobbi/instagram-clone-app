import { useState, useEffect } from 'react'
import firebase from "../services/firebase";

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
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collectionGroup('reels')
      .onSnapshot(
        (snapshot) => {
          const vids = snapshot.docs.map(normalizeVideo);
          vids.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
          setVideos(vids);
        },
        (error) => {
          console.error('Error fetching reels:', error);
          setVideos([]);
        }
      );
    return unsubscribe;
  }, []);

  return {
    videos,
  };
};

export default useFetchMoments;
