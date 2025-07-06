import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthPersistence = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error('Error reading user from storage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  return { isLoading, user };
};

export default useAuthPersistence;
