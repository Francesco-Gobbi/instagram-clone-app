import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

const useImageGallery = ({ setSelectedImage }) => {
  const [loading, setLoading] = useState(false);

  const ChooseImageFromGallery = async () => {
    try {
      setLoading(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        alert('Spiacente, abbiamo bisogno dei permessi per accedere alle foto!');
        return;
      }

      const options = {
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      };

      // Apri il picker
      const result = await ImagePicker.launchImageLibraryAsync(options);

      console.log('Risultato ImagePicker:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        if (!selectedAsset.uri) {
          throw new Error('URI dell\'asset selezionato non valido');
        }

        console.log('Asset selezionato');

        setSelectedImage(selectedAsset);

        return selectedAsset;
      } else {
        console.log('Selezione annullata dall\'utente');
        return null;
      }

    } catch (error) {
      console.error('Errore nella selezione immagine:', error);
      alert('Errore nella selezione dell\'immagine: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const ChooseVideoFromGallery = async () => {
    try {
      setLoading(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        alert('Spiacente, abbiamo bisogno dei permessi per accedere ai video!');
        return;
      }

      const options = {
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
        videoMaxDuration: 60,
      };

      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        if (!selectedAsset.uri) {
          throw new Error('URI del video selezionato non valido');
        }

        console.log('Video selezionato');

        setSelectedImage(selectedAsset);
        return selectedAsset;
      }

      return null;

    } catch (error) {
      console.error('Errore nella selezione video:', error);
      alert('Errore nella selezione del video: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const TakePhotoWithCamera = async () => {
    try {
      setLoading(true);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        alert('Spiacente, abbiamo bisogno dei permessi per accedere alla camera!');
        return;
      }

      const options = {
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
      };

      const result = await ImagePicker.launchCameraAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedAsset = result.assets[0];

        if (!capturedAsset.uri) {
          throw new Error('URI della foto scattata non valido');
        }

        console.log('Foto scattata');

        setSelectedImage(capturedAsset);
        return capturedAsset;
      }

      return null;

    } catch (error) {
      console.error('Errore nello scattare la foto:', error);
      alert('Errore nello scattare la foto: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    ChooseImageFromGallery,
    ChooseVideoFromGallery,
    TakePhotoWithCamera,
    loading,
  };
};

export default useImageGallery;