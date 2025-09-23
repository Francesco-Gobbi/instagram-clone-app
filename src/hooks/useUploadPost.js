import { useState } from 'react'
import firebase from "../services/firebase";
import useUploadPicture from './useUploadPicture'

const useUploadPost = () => {
    const [loader, setLoader] = useState(false)
    const { uploadPicture } = useUploadPicture()

    const uploadPost = async (imageUrl, caption, currentUser) => {
        if (!loader) {
            setLoader(true);
            try {
                const timestamp = new Date().getTime();
                const imageUri = typeof imageUrl === 'string' ? imageUrl : imageUrl.uri;

                console.log('Inizio upload post con immagine:', imageUri);

                const uploadedImageUrl = await uploadPicture(
                    imageUri,
                    currentUser.email,
                    `post_${timestamp}`
                );

                const newPost = {
                    imageUrl: uploadedImageUrl,
                    username: currentUser.username,
                    profile_picture: currentUser.profile_picture,
                    owner_uid: currentUser.owner_uid,
                    owner_email: currentUser.email,
                    caption: caption || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),

                    likes_by_users: [],
                    new_likes: null,
                    comments: [],

                    likesCount: 0,
                    commentsCount: 0
                }

                console.log('Salvataggio post in Firestore...');

                // Usa Firebase v8 API
                const docRef = await firebase
                    .firestore()
                    .collection("users")
                    .doc(currentUser.email)
                    .collection("posts")
                    .add(newPost);

                console.log('Post salvato con ID:', docRef.id);

                return {
                    postId: docRef.id,
                    imageUrl: uploadedImageUrl
                };

            } catch (error) {
                console.error("Upload post error:", error);
                throw error;
            } finally {
                setLoader(false);
            }
        }
    }

    return {
        uploadPost,
        loader
    }
}

export default useUploadPost
