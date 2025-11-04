import { useState, useEffect } from 'react';
import firebase from "../services/firebase";
import { useUserContext } from "../contexts/UserContext";

const useFetchStories = () => {
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatedStories, setUpdatedStories] = useState(0);

    const { currentUser } = useUserContext();

    useEffect(() => {

        const unsubscribe = firebase
            .firestore()
            .collectionGroup("stories")
            .onSnapshot((snapshot) => {
                const allStories = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }))
                    .filter(story => {
                        // filter out stories from blocked users
                        if (currentUser && currentUser.blockedUsers && currentUser.blockedUsers.includes(story.owner_email)) return false;
                        // filter hidden stories per user
                        if (currentUser && currentUser.hiddenStories && currentUser.hiddenStories.includes(story.id)) return false;
                        if (story.blockedBy && Array.isArray(story.blockedBy) && story.blockedBy.includes(currentUser?.owner_uid)) return false;
                        return true;
                    });
                setStories(allStories);
                setUpdatedStories((prev) => prev + 1);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching stories: ", error);
                setIsLoading(false);
            });

        return () => unsubscribe();
    }, [currentUser]);

    return {
        stories,
        isLoading,
        updatedStories
    }
}

export default useFetchStories;