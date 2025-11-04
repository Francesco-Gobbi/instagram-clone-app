import firebase from "../services/firebase";
import { useEffect, useState } from "react";

const DEFAULT_PROFILE_PICTURE = "https://randomuser.me/api/portraits/women/53.jpg";

const EMPTY_USER = {
  email: "",
  owner_uid: "",
  username: "",
  name: "",
  bio: "",
  link: "",
  gender: "",
  profile_picture: DEFAULT_PROFILE_PICTURE,
  followers: [],
  following: [],
  followers_request: [],
  following_request: [],
  favorite_users: [],
  close_friends: [],
  muted_users: [],
  saved_posts: [],
  blockedUsers: [],
  chat_notification: 0,
  event_notification: 0,
  status: "pending",
  acceptedTerms: false,
  acceptedTermsVersion: null,
  acceptedTermsAt: null,
};

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(EMPTY_USER);

  useEffect(() => {
    const user = firebase.auth().currentUser;

    if (!user) {
      setCurrentUser(EMPTY_USER);
      return undefined;
    }

    const unsubscribe = firebase
      .firestore()
      .collection('users')
      .doc(user.email)
      .onSnapshot(
        (snapshot) => {
          if (snapshot.exists) {
            const data = snapshot.data() || {};
            setCurrentUser({ ...EMPTY_USER, ...data });
          } else {
            setCurrentUser({ ...EMPTY_USER, email: user.email, owner_uid: user.uid });
          }
        },
        async (error) => {
          console.error('Error fetching current user:', error);
          setCurrentUser(EMPTY_USER);
          if (error?.code === 'permission-denied') {
            try {
              await firebase.auth().signOut();
            } catch (signOutError) {
              console.error('Error signing out after permission denial:', signOutError);
            }
          }
        }
      );

    return unsubscribe;
  }, []);

  return {
    currentUser,
  };
};
