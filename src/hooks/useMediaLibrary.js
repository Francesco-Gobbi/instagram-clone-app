import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';

const useMediaLibrary = (selectedAlbum) => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, [selectedAlbum]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Permesso negato per accedere alla libreria media');
      }

      const mediaOptions = {
        first: 30,
        sortBy: [MediaLibrary.SortBy.creationTime],
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        album: selectedAlbum,
      };

      const mediaAssets = await MediaLibrary.getAssetsAsync(mediaOptions);

      const imageAssets = [];
      const videoAssets = [];

      for (const asset of mediaAssets.assets) {
        try {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);

          const processedAsset = {
            id: asset.id,
            uri: assetInfo.localUri || assetInfo.uri || asset.uri,
            filename: asset.filename,
            mediaType: asset.mediaType,
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            creationTime: asset.creationTime,
            modificationTime: asset.modificationTime,
          };

          if (!processedAsset.uri) {
            console.warn('Asset senza URI valido:', asset.id);
            continue;
          }

          if (asset.mediaType === MediaLibrary.MediaType.photo) {
            imageAssets.push(processedAsset);
          } else if (asset.mediaType === MediaLibrary.MediaType.video) {
            videoAssets.push(processedAsset);
          }
        } catch (assetError) {
          console.warn('Errore nel processare asset:', asset.id, assetError);
        }
      }

      console.log(`Recuperate ${imageAssets.length} immagini e ${videoAssets.length} video`);

      setImages(imageAssets);
      setVideos(videoAssets);

      if (mediaAssets.hasNextPage) {
        console.log('Ci sono più media disponibili - implementa pagination se necessario');
      }

    } catch (err) {
      console.error('Errore nel recupero dei media:', err);
      setError(err.message);
      setImages([]);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const refetchMedia = () => {
    fetchMedia();
  };

  const loadMoreMedia = async () => {
    try {
      console.log('LoadMore non ancora implementato');
    } catch (err) {
      console.error('Errore nel caricamento di più media:', err);
    }
  };

  return {
    images,
    videos,
    loading,
    error,
    refetchMedia,
    loadMoreMedia,
  };
};

export default useMediaLibrary;