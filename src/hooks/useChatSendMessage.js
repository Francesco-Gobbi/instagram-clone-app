import { useState } from 'react'
import firebase from '../services/firebase';
import useChatAddUser from "./useChatAddUser";

const useChatSendMessage = ({ user, currentUser }) => {
    const { chatAddUser } = useChatAddUser();
    const [loading, setLoading] = useState(false);
    const [textMessage, setTextMessage] = useState("");

    const sendPostComment = async ({ postId, postOwnerEmail, message }) => {
        if (!postId || !postOwnerEmail || !message?.trim()) return;

        setLoading(true);
        try {
            const postRef = firebase.firestore()
                .collection('users')
                .doc(postOwnerEmail)
                .collection('stories')
                .doc(postId);

            const comment = {
                message: message.trim(),
                sender_email: currentUser.email,
                timestamp: new Date(Date.now()),
                _type: 'story_comment',
            };

            await postRef.update({
                comments: firebase.firestore.FieldValue.arrayUnion(comment)
            }, { merge: true });

            await firebase.firestore()
                .collection('users')
                .doc(postOwnerEmail)
                .set({
                    event_notification: firebase.firestore.FieldValue.increment(1)
                }, { merge: true });

            console.log('Commento inviato con successo al post:', postId);
            setTextMessage("");
            return { ok: true };
        } catch (e) {
            console.log('sendPostComment error:', e);
            return { ok: false, error: e };
        } finally {
            setLoading(false);
        }
    };

    const chatSendMessage = async () => {
        if (!loading) {
            setLoading(true);
            try {
                if (user.status === undefined) {
                    await chatAddUser(user);
                }

                const notification = {
                    chat_notification: firebase.firestore.FieldValue.increment(1)
                }

                const current = {
                    email: currentUser.email,
                    name: currentUser.name,
                    profile_picture: currentUser.profile_picture,
                    username: currentUser.username,
                    status: "unseen",
                };

                const newCurrentMessage = {
                    message: textMessage,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    who: "current",
                };

                const newUserMessage = {
                    message: textMessage,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    who: "user",
                };

                const batch = firebase.firestore().batch();

                const userRef = firebase
                    .firestore()
                    .collection("users")
                    .doc(user.email)

                const currentChatRef = firebase
                    .firestore()
                    .collection("users")
                    .doc(currentUser.email)
                    .collection("chat")
                    .doc(user.email);

                const newUserChatRef = firebase
                    .firestore()
                    .collection("users")
                    .doc(user.email)
                    .collection("chat")
                    .doc(currentUser.email);

                batch.set(userRef, notification, { merge: true });
                batch.set(newUserChatRef, current, { merge: true });
                batch.set(
                    currentChatRef.collection("messages").doc(),
                    newCurrentMessage
                );
                batch.set(newUserChatRef.collection("messages").doc(), newUserMessage);

                await batch.commit();
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
                setTextMessage("");
            }
        }
    };

    return {
        chatSendMessage,
        sendPostComment,
        loading,
        textMessage,
        setTextMessage
    };
}

export default useChatSendMessage;
