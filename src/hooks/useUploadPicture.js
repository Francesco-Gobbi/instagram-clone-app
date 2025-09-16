import { useState } from "react";
import appwriteService from "../services/appwrite";

const useUploadPicture = () => {
  const [uploading, setUploading] = useState(false);

  const uploadPicture = async (uri, email, name) => {
    if (!uploading) {
      setUploading(true);
      try {
        // Verifica che l'URI sia valido
        if (!uri || typeof uri !== 'string') {
          throw new Error('URI immagine non valido');
        }

        console.log('URI da caricare:', uri);
        console.log('Nome file:', name);

        const timestamp = typeof name === 'string' ? name : new Date().getTime().toString();
        const fileName = `${timestamp}.jpg`;

        const onProgress = (progress) => {
          console.log("Upload is " + progress + "% done");
        };

        // Assicurati che appwriteService.uploadImage gestisca correttamente l'URI
        const downloadUrl = await appwriteService.uploadImage(uri, email, fileName, onProgress);

        let urlString = downloadUrl;

        // Gestisci diversi tipi di risposta da appwriteService
        if (typeof downloadUrl === 'object') {
          if (downloadUrl.href) {
            urlString = downloadUrl.href;
          } else if (downloadUrl.url) {
            urlString = downloadUrl.url;
          } else if (downloadUrl.toString && typeof downloadUrl.toString === 'function') {
            urlString = downloadUrl.toString();
          } else {
            urlString = downloadUrl.$id || downloadUrl.fileId || JSON.stringify(downloadUrl);
          }
        }

        console.log('Upload completato, URL finale:', urlString);

        // Verifica che l'URL sia una stringa valida
        if (typeof urlString !== 'string' || urlString.length === 0) {
          throw new Error('URL di download non valido ricevuto da Appwrite');
        }

        return urlString;

      } catch (error) {
        console.error("Appwrite upload error:", error);
        console.error("URI che ha causato l'errore:", uri);
        console.error("Email utente:", email);
        throw error;
      } finally {
        setUploading(false);
      }
    }
  };

  return {
    uploadPicture,
    uploading
  }
}

export default useUploadPicture;