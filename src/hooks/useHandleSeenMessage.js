import firebase from "../services/firebase";

const useHandleSeenMessage = () => {

    const handleSeenMessage = async (user, currentUser) => {
        await firebase
            .firestore()
            .collection("users")
            .doc(currentUser.email)
            .collection("chat")
            .doc(user.email)
            .update({
                status: "seen",
            });
    };

    return {
        handleSeenMessage
    }
}

export default useHandleSeenMessage