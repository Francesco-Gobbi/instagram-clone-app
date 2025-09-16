import { useState } from "react";
import { doc, updateDoc, collection, query, getDocs, writeBatch } from 'firebase/firestore';
import { db } from "../services/firebase";
import appwriteService from "../services/appwrite";

const useUploadProfilePicture = () => {
    const [loader, setLoader] = useState(false);

    const uploadProfilePicture = async (uri, email) => {
        if (!loader) {
            setLoader(true);
            try {
                let profilePictureUrl = uri;

                if (!uri.includes('appwrite')) {
                    const timestamp = new Date().getTime();
                    const fileName = `profile_${timestamp}.jpg`;

                    console.log('Upload nuova immagine profilo:', uri);
                    const uploadResult = await appwriteService.uploadImage(uri, email, fileName);

                    if (typeof uploadResult === 'object' && uploadResult.href) {
                        profilePictureUrl = uploadResult.href;
                    } else if (typeof uploadResult === 'object' && uploadResult.toString) {
                        profilePictureUrl = uploadResult.toString();
                    } else {
                        profilePictureUrl = uploadResult;
                    }
                }

                if (typeof profilePictureUrl !== 'string') {
                    throw new Error('URL immagine profilo non valido');
                }

                console.log('Aggiornamento profilo utente con URL:', profilePictureUrl);

                const batch = writeBatch(db);

                const userRef = doc(db, "users", email);
                batch.update(userRef, {
                    profile_picture: profilePictureUrl,
                });

                console.log('Profilo utente aggiornato, ora aggiorno i post...');

                const postsQuery = query(collection(db, "users", email, "posts"));
                const postsSnapshot = await getDocs(postsQuery);

                postsSnapshot.docs.forEach(docSnapshot => {
                    batch.update(docSnapshot.ref, {
                        profile_picture: profilePictureUrl,
                    });
                });

                console.log('Aggiornamento storie...');

                const storiesQuery = query(collection(db, "users", email, "stories"));
                const storiesSnapshot = await getDocs(storiesQuery);

                storiesSnapshot.docs.forEach(docSnapshot => {
                    batch.update(docSnapshot.ref, {
                        profile_picture: profilePictureUrl,
                    });
                });

                console.log('Aggiornamento reels...');

                const reelsQuery = query(collection(db, "users", email, "reels"));
                const reelsSnapshot = await getDocs(reelsQuery);

                reelsSnapshot.docs.forEach(docSnapshot => {
                    batch.update(docSnapshot.ref, {
                        profile_picture: profilePictureUrl,
                    });
                });

                await batch.commit();
                console.log('Tutti gli aggiornamenti completati');

                return profilePictureUrl;

            } catch (error) {
                console.error("Upload profile picture error:", error);

                if (error.message && error.message.includes('invalid data')) {
                    console.error('URI che ha causato l\'errore:', uri);
                    console.error('Email utente:', email);
                }

                throw error;
            } finally {
                setLoader(false);
            }
        }
    };

    return {
        uploadProfilePicture,
        loader
    }
}

export default useUploadProfilePicture