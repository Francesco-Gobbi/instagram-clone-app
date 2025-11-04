import { useState, useEffect } from "react";
import * as MediaLibrary from "expo-media-library";

const MEDIA_FETCH_LIMIT = 18;

const useMediaLibrary = (selectedAlbum, selectedType) => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, [selectedAlbum, selectedType]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        throw new Error("Permesso negato per accedere alla libreria media");
      }

      const isMomentSelection = (selectedType || "").toLowerCase() === "new moment";

      const mediaOptions = {
        first: MEDIA_FETCH_LIMIT,
        sortBy: [MediaLibrary.SortBy.creationTime],
        mediaType: isMomentSelection
          ? [MediaLibrary.MediaType.video]
          : [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        album: selectedAlbum,
      };

      const mediaAssets = await MediaLibrary.getAssetsAsync(mediaOptions);

      const processedAssets = await Promise.all(
        mediaAssets.assets.map(async (asset) => {
          try {
            const shouldDownload =
              isMomentSelection && asset.mediaType === MediaLibrary.MediaType.video;

            const assetInfo = await MediaLibrary.getAssetInfoAsync(
              asset,
              shouldDownload ? { shouldDownload: true } : undefined
            );

            const uri = assetInfo?.localUri || assetInfo?.uri || asset.uri;

            if (!uri) {
              console.warn("Asset senza URI valido:", asset.id);
              return null;
            }

            return {
              id: asset.id,
              uri,
              filename: assetInfo?.filename || asset.filename,
              mediaType: asset.mediaType,
              width: asset.width,
              height: asset.height,
              duration: asset.duration,
              creationTime: asset.creationTime,
              modificationTime: asset.modificationTime,
            };
          } catch (assetError) {
            console.warn("Errore nel processare asset:", asset.id, assetError);
            return null;
          }
        })
      );

      const imageAssets = [];
      const videoAssets = [];

      processedAssets.forEach((asset) => {
        if (!asset) {
          return;
        }

        if (asset.mediaType === MediaLibrary.MediaType.photo) {
          imageAssets.push(asset);
        } else if (asset.mediaType === MediaLibrary.MediaType.video) {
          videoAssets.push(asset);
        }
      });

      setImages(imageAssets);
      setVideos(videoAssets);

      if (mediaAssets.hasNextPage) {
        console.log(
          "Sono disponibili altri media - implementa pagination se necessario"
        );
      }
    } catch (err) {
      console.error("Errore nel recupero dei media:", err);
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
      console.log("LoadMore non ancora implementato");
    } catch (err) {
      console.error("Errore nel caricamento di piu media:", err);
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
