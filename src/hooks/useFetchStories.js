import { useState, useEffect } from 'react';
import firebase from "../services/firebase";

const useFetchStories = () => {
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatedStories, setUpdatedStories] = useState(0);

    useEffect(() => {
        const unsubscribe = firebase
            .firestore()
            .collectionGroup("stories")
            .onSnapshot((snapshot) => {
                const allStories = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                setStories(allStories);
                setUpdatedStories((prev) => prev + 1);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching stories: ", error);
                setIsLoading(false);
            });

        return () => unsubscribe();
    }, []);

    return {
        stories,
        isLoading,
        updatedStories
    }
}

export default useFetchStories;