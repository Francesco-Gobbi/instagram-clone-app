import firebase from "../services/firebase";
import { useUserContext } from "../contexts/UserContext";

const useBlockUser = () => {
  const { currentUser } = useUserContext();

  const handleBlockUser = async (userToBlockEmail) => {
    if (!currentUser || !userToBlockEmail) {
      return;
    }

    try {
      const currentUserId = currentUser.email;
      const batch = firebase.firestore().batch();

      // Add userToBlockEmail to the current user's blockedUsers list
      const currentUserRef = firebase
        .firestore()
        .collection("users")
        .doc(currentUserId);
      batch.update(currentUserRef, {
        blockedUsers:
          firebase.firestore.FieldValue.arrayUnion(userToBlockEmail),
      });

      // Add currentUserId to the blocked user's blockedBy list
      const userToBlockRef = firebase
        .firestore()
        .collection("users")
        .doc(userToBlockEmail);
      batch.update(userToBlockRef, {
        blockedBy: firebase.firestore.FieldValue.arrayUnion(currentUserId),
      });

      // Remove userToBlockEmail from the current user's following list
      batch.update(currentUserRef, {
        following: firebase.firestore.FieldValue.arrayRemove(userToBlockEmail),
      });

      // Remove currentUserId from the userToBlock's following list
      batch.update(userToBlockRef, {
        following: firebase.firestore.FieldValue.arrayRemove(currentUserId),
      });

      // Remove userToBlockEmail from the current user's followers list
      batch.update(currentUserRef, {
        followers: firebase.firestore.FieldValue.arrayRemove(userToBlockEmail),
      });

      // Remove currentUserId from the userToBlock's followers list
      batch.update(userToBlockRef, {
        followers: firebase.firestore.FieldValue.arrayRemove(currentUserId),
      });

      await batch.commit();
    } catch (error) {
      console.log("Error blocking user:", error);
    }
  };

  return {
    handleBlockUser,
  };
};

export default useBlockUser;
