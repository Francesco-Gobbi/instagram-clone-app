import { useState } from 'react'
import firebase from "../services/firebase";
import useUploadPicture from './useUploadPicture'

const useUploadStory = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { uploadPicture } = useUploadPicture()

    const uploadStory = async (imageUrl, currentUser) => {
        if (!isLoading) {
            setIsLoading(true);
            try {
                const timestamp = new Date().getTime();

                console.log('Inizio upload story con immagine:', imageUrl);

                // uploadPicture restituisce solo l'URL string
                const uploadedImageUrl = await uploadPicture(
                    imageUrl,
                    currentUser.email,
                    `story_${timestamp}`
                );

                const newStory = {
                    imageUrl: uploadedImageUrl,

                    username: currentUser.username,
                    name: currentUser.name,
                    profile_picture: currentUser.profile_picture,
                    owner_uid: currentUser.owner_uid,
                    owner_email: currentUser.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),

                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),

                    likes_by_users: [],
                    new_likes: null,
                    seen_by_users: [],

                    likesCount: 0,
                    viewsCount: 0,

                    isActive: true
                }

                console.log('Salvataggio story in Firestore...');

                const docRef = await firebase
                    .firestore()
                    .collection("users")
                    .doc(currentUser.email)
                    .collection("stories")
                    .add(newStory);

                return {
                    storyId: docRef.id,
                    imageUrl: uploadedImageUrl,
                    expiresAt: newStory.expiresAt
                };

            } catch (error) {
                console.error("Upload story error:", error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        }
    }

    return {
        uploadStory,
        isLoading
    }
}

export default useUploadStory
