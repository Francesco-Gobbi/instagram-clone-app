import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const CACHE_DIR = `${FileSystem.cacheDirectory}media-picker`;

const ensureCacheDirAsync = async () => {
  try {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  } catch (error) {
    if (error?.message?.includes('EEXIST')) {
      return;
    }
    console.warn('Impossibile creare la cache per i media:', error);
  }
};

const resolveAssetUriAsync = async (asset) => {
  if (!asset) {
    return asset;
  }

  let uri = asset.localUri || asset.uri;
  let filename = asset.filename;
  const assetId = asset.assetId || asset.id;

  const loadAssetInfoAsync = async (shouldDownload = false) => {
    if (!assetId) {
      return null;
    }

    try {
      const info = await MediaLibrary.getAssetInfoAsync(assetId, shouldDownload ? { shouldDownload: true } : undefined);
      return info;
    } catch (error) {
      console.warn('Impossibile recuperare le informazioni dell\'asset:', assetId, error);
      return null;
    }
  };

  let assetInfo = await loadAssetInfoAsync(false);

  if (!assetInfo?.localUri && assetInfo?.downloaded === false) {
    assetInfo = await loadAssetInfoAsync(true) || assetInfo;
  }

  if (assetInfo) {
    uri = assetInfo.localUri || assetInfo.uri || uri;
    filename = assetInfo.filename || filename;
  }

  if (uri?.startsWith('ph://')) {
    if (assetInfo?.localUri && assetInfo.localUri.startsWith('file://')) {
      uri = assetInfo.localUri;
    } else {
      await ensureCacheDirAsync();
      const extension = (filename && filename.includes('.'))
        ? filename.substring(filename.lastIndexOf('.') + 1)
        : (asset.mediaType === MediaLibrary.MediaType.video ? 'mp4' : 'jpg');
      const targetPath = `${CACHE_DIR}/${assetId || Date.now().toString()}.${extension}`;

      try {
        if (assetInfo?.localUri) {
          await FileSystem.copyAsync({ from: assetInfo.localUri, to: targetPath });
          uri = targetPath;
        } else if (assetInfo?.uri && assetInfo.uri.startsWith('file://')) {
          await FileSystem.copyAsync({ from: assetInfo.uri, to: targetPath });
          uri = targetPath;
        }
      } catch (error) {
        console.warn('Impossibile copiare l\'asset nella cache locale:', error);
      }
    }
  }

  return {
    ...asset,
    uri,
    localUri: uri,
    filename,
  };
};

const prepareAssetForSelectionAsync = async (asset) => {
  const prepared = await resolveAssetUriAsync(asset);

  if (!prepared?.uri) {
    throw new Error('URI asset non valido');
  }

  if (prepared.uri.startsWith('ph://')) {
    throw new Error('Non ? stato possibile accedere al file selezionato.');
  }

  return prepared;
};

const useImageGallery = ({ setSelectedImage }) => {
  const [loading, setLoading] = useState(false);

  const handleAssetSelection = async (asset, fallbackMessage) => {
    try {
      const preparedAsset = await prepareAssetForSelectionAsync(asset);
      setSelectedImage(preparedAsset);
      return preparedAsset;
    } catch (error) {
      console.error(fallbackMessage || "Errore selezione asset", error);
      if (fallbackMessage) {
        alert(`${fallbackMessage}: ${error.message}`);
      } else {
        alert(error.message);
      }
      return null;
    }
  };

  const ChooseImageFromGallery = async () => {
    try {
      setLoading(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        alert('Spiacente, abbiamo bisogno dei permessi per accedere alle foto!');
        return null;
      }

      const options = {
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      };

      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        return await handleAssetSelection(selectedAsset, 'Impossibile selezionare la foto.');
      }

      return null;
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
        return null;
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
        return await handleAssetSelection(selectedAsset, 'Impossibile selezionare il video.');
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
        return null;
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
        const preparedAsset = await resolveAssetUriAsync(capturedAsset);
        setSelectedImage(preparedAsset);
        return preparedAsset;
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
