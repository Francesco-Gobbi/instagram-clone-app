import { Client, Storage, ID } from 'appwrite';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const appwriteEndpoint = Constants.expoConfig?.extra?.appwriteEndpoint
const appwriteProjectId = Constants.expoConfig?.extra?.appwriteProjectId
const appwriteBucketId = Constants.expoConfig?.extra?.appwriteBucketId

class AppwriteService {
    constructor() {
        this.client = new Client();
        this.storage = new Storage(this.client);

        this.client
            .setEndpoint(appwriteEndpoint)
            .setProject(appwriteProjectId);
    }

    async uploadImage(uri, email, fileName, onProgress = null) {
        try {
            console.log('Inizio upload su Appwrite:', { uri, email, fileName });

            if (!uri || typeof uri !== 'string') {
                throw new Error('URI non valido fornito per l\'upload');
            }

            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error(`File non trovato: ${uri}`);
            }

            console.log('Info file:', fileInfo);

            let fileBlob;

            if (uri.startsWith('file://')) {
                const fileContent = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                const response = await fetch(`data:image/jpeg;base64,${fileContent}`);
                fileBlob = await response.blob();
            } else if (uri.startsWith('content://') || uri.startsWith('ph://')) {
                const response = await fetch(uri);
                fileBlob = await response.blob();
            } else {
                const response = await fetch(uri);
                fileBlob = await response.blob();
            }

            console.log('Blob creato, dimensione:', fileBlob.size);

            if (fileBlob.size === 0) {
                throw new Error('Il file è vuoto (0 bytes)');
            }

            const file = new File([fileBlob], fileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            console.log('File object creato:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            const bucketId = appwriteBucketId;
            const fileId = ID.unique();

            const uploadedFile = await this.storage.createFile(
                bucketId,
                fileId,
                file,
                onProgress ? [onProgress] : undefined
            );

            console.log('File caricato su Appwrite:', uploadedFile);

            const fileUrl = this.storage.getFileView(bucketId, uploadedFile.$id);

            console.log('URL generato:', fileUrl);

            return fileUrl.toString();

        } catch (error) {
            console.error('Errore durante l\'upload su Appwrite:', error);

            // Fornisci informazioni più dettagliate sull'errore
            if (error.message?.includes('File size')) {
                throw new Error('File troppo grande per l\'upload');
            } else if (error.message?.includes('permission')) {
                throw new Error('Permessi insufficienti per l\'upload');
            } else if (error.message?.includes('network')) {
                throw new Error('Errore di connessione durante l\'upload');
            }

            throw error;
        }
    }

    // Metodo per eliminare un file (utile per cleanup)
    async deleteFile(bucketId, fileId) {
        try {
            await this.storage.deleteFile(bucketId, fileId);
            console.log('File eliminato:', fileId);
        } catch (error) {
            console.error('Errore durante l\'eliminazione del file:', error);
            throw error;
        }
    }

    // Metodo per ottenere informazioni su un file
    async getFileInfo(bucketId, fileId) {
        try {
            const file = await this.storage.getFile(bucketId, fileId);
            return file;
        } catch (error) {
            console.error('Errore durante il recupero info file:', error);
            throw error;
        }
    }
}

const appwriteService = new AppwriteService();
export default appwriteService;