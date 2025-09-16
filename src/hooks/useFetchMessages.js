import { useEffect, useState } from 'react';
import firebase from '../services/firebase';

const useFetchMessages = ({ user, currentUser }) => {
    const [data, setData] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!user || !currentUser) return;

        const unsubscribe =
            firebase
                .firestore()
                .collection('users')
                .doc(currentUser.email)
                .collection('chat')
                .doc(user.email)
                .collection('messages')
                .orderBy('timestamp', 'asc')
                .onSnapshot((snapshot) => {
                    setData(snapshot.docs.map((doc) => doc.data()));
                });

        return () => unsubscribe(); // Clean up listener on unmount
    }, [user, currentUser]);

    useEffect(() => {
        const formattedDate = (seconds) => {
            const messageDate = new Date(seconds * 1000);
            const currentDate = new Date();

            const daysAgo = (currentDate - messageDate) / (1000 * 60 * 60 * 24);
            if (daysAgo < 1) return 'today';
            if (daysAgo < 2) return 'yesterday';

            const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
            const mes = meses[messageDate.getMonth()];
            const dia = messageDate.getDate();
            const hora = messageDate.getHours() % 12 || 12;
            const minutos = messageDate.getMinutes().toString().padStart(2, '0');
            const amPm = messageDate.getHours() < 12 ? 'AM' : 'PM';

            return `${mes} ${dia} AT ${hora}:${minutos} ${amPm}`;
        };

        const areDatesEqual = (date1, date2) =>
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();

        const addDateDividerToChat = () => {
            if (data && data.length > 0) {
                let messagesWithDateDivider = [];
                let lastTimestampDate = null;

                for (let message of data) {
                    if (message.timestamp) {
                        const messageDate = new Date(message.timestamp.seconds * 1000);

                        if (!lastTimestampDate || !areDatesEqual(messageDate, lastTimestampDate)) {
                            messagesWithDateDivider.push({
                                who: 'timestamp',
                                timestamp: formattedDate(message.timestamp.seconds),
                            });
                            lastTimestampDate = messageDate;
                        }
                    }
                    messagesWithDateDivider.push(message);
                }

                setMessages(messagesWithDateDivider);
            }
        };

        addDateDividerToChat();
    }, [data]);

    return { messages };
};

export default useFetchMessages;
