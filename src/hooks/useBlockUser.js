import { databases } from '../services/appwrite';
import { ID, Query } from 'appwrite';
import { useUserContext } from '../contexts/UserContext';

const useBlockUser = () => {
  const { currentUser } = useUserContext();

  const handleBlockUser = async (userToBlockEmail) => {
    if (!currentUser || !userToBlockEmail) {
      return;
    }

    try {
      // Get the current user's document
      const currentUserDoc = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_USERS_COLLECTION_ID,
        [Query.equal('email', currentUser.email)]
      );

      // Get the blocked user's document
      const blockedUserDoc = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_USERS_COLLECTION_ID,
        [Query.equal('email', userToBlockEmail)]
      );

      if (currentUserDoc.documents.length === 0 || blockedUserDoc.documents.length === 0) {
        throw new Error('User not found');
      }

      const currentUserData = currentUserDoc.documents[0];
      const blockedUserData = blockedUserDoc.documents[0];

      // Update current user's blockedUsers array
      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_USERS_COLLECTION_ID,
        currentUserData.$id,
        {
          blockedUsers: [...(currentUserData.blockedUsers || []), userToBlockEmail],
          following: (currentUserData.following || []).filter(email => email !== userToBlockEmail),
          followers: (currentUserData.followers || []).filter(email => email !== userToBlockEmail),
        }
      );

      // Update blocked user's blockedBy array
      await databases.updateDocument(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.EXPO_PUBLIC_USERS_COLLECTION_ID,
        blockedUserData.$id,
        {
          blockedBy: [...(blockedUserData.blockedBy || []), currentUser.email],
          following: (blockedUserData.following || []).filter(email => email !== currentUser.email),
          followers: (blockedUserData.followers || []).filter(email => email !== currentUser.email),
        }
      );

      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  return { handleBlockUser };
};

export default useBlockUser;
