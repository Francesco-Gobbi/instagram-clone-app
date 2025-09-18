import { useState } from "react";
import appwriteService from "../services/appwrite";

const useUploadPicture = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPicture = async (uri, email, name) => {
    if (uploading) {
      console.warn('Upload già in corso, attendere...');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (!uri || typeof uri !== 'string') {
        throw new Error('URI immagine non valido');
      }

      const timestamp = typeof name === 'string' ? name : new Date().getTime().toString();
      const fileName = timestamp.includes('.') ? timestamp : `${timestamp}.jpg`;

      const onProgress = (progress) => {
        setUploadProgress(progress);
      };

      // Upload diretto con Appwrite SDK
      const result = await appwriteService.uploadImage(uri, email, fileName, onProgress);

      if (!result) {
        throw new Error('URL di download non ricevuto');
      }

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);

      return result;

    } catch (error) {
      console.error("Errore upload:", error);
      setUploadProgress(0);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadVideo = async (uri, email, name) => {
    if (uploading) return;

    const fileName = name.includes('.') ? name : `${name}.mp4`;
    const onProgress = (progress) => setUploadProgress(progress);

    const result = await appwriteService.uploadVideo(uri, email, fileName, onProgress);
    return typeof result === 'string' ? result : result.fileUrl;
  };

  return {
    uploadPicture,
    uploadVideo,
    uploading,
    uploadProgress
  }
}

export default useUploadPicture;