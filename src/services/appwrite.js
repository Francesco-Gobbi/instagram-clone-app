import { Client, Storage, ID, Account } from 'react-native-appwrite';
import * as FileSystem from 'expo-file-system/legacy';
import { auth } from '../services/firebase';
import Constants from 'expo-constants';

class AppwriteService {
    constructor() {
        this.client = new Client();

        const appwriteEndpoint = Constants.expoConfig?.extra?.appwriteEndpoint;
        const appwriteProjectId = Constants.expoConfig?.extra?.appwriteProjectId;

        this.client
            .setEndpoint(appwriteEndpoint)
            .setProject(appwriteProjectId);

        this.storage = new Storage(this.client);
        this.account = new Account(this.client);

        this.signedImageUri = Constants.expoConfig?.extra?.signedImageUri;
        this.bucketId = Constants.expoConfig?.extra?.appwriteBucketId;

        if (!appwriteEndpoint || !appwriteProjectId || !this.bucketId || !this.signedImageUri) {
            console.warn('AppwriteService: Configurazione mancantea. Verifica le variabili d\'ambiente.');
        }
    }

    // Ottieni il token Firebase dell'utente corrente (se necessario per validazioni custom)
    async getFirebaseToken() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Utente non autenticato su Firebase');
            }
            return await user.getIdToken();
        } catch (error) {
            console.error('Errore recupero token Firebase:', error);
            throw error;
        }
    }

    // Determina il tipo MIME dal nome file
    getMimeType(fileName) {
        const lowerFileName = (fileName || '').toLowerCase();

        if (lowerFileName.includes('.png')) {
            return 'image/png';
        } else if (lowerFileName.includes('.jpg') || lowerFileName.includes('.jpeg')) {
            return 'image/jpeg';
        } else if (lowerFileName.includes('.gif')) {
            return 'image/gif';
        } else if (lowerFileName.includes('.webp')) {
            return 'image/webp';
        } else if (lowerFileName.includes('.mp4')) {
            return 'video/mp4';
        } else if (lowerFileName.includes('.mov')) {
            return 'video/quicktime';
        } else if (lowerFileName.includes('.avi')) {
            return 'video/x-msvideo';
        }

        return 'application/octet-stream';
    }

    // Crea un File object compatibile con React Native per Appwrite
    async createFileFromUri(uri, fileName, maxSize) {
        try {
            console.log('Creazione File da URI:', { uri, fileName });
            const uriInstance = new URL(uri);
            // Verifica che il file esista
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error(`File non trovato: ${uri}`);
            }

            console.log('File info:', fileInfo);

            // Controllo dimensione file
            if (fileInfo.size > maxSize) {
                const sizeMB = (fileInfo.size / 1024 / 1024).toFixed(2);
                const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
                throw new Error(`Il file è troppo grande (${sizeMB}MB). Il limite è ${maxSizeMB}MB.`);
            }

            if (fileInfo.size === 0) {
                throw new Error('Il file è vuoto (0 bytes)');
            }

            const mimeType = this.getMimeType(fileName);

            // Per React Native/Expo, crea un oggetto che simula File
            // Questo è compatibile con l'SDK Appwrite
            const file = {
                name: uriInstance.pathname.split('/').pop(),
                type: mimeType,
                size: fileInfo.size,
                uri: uriInstance.href
            };
            console.log('File: ', file)
            return file;

        } catch (error) {
            console.error('Errore creazione file:', error);
            throw error;
        }
    }

    // Upload file generico (immagini e video)
    async uploadFile(uri, email, fileName, fileType = 'image', onProgress = null) {
        try {
            console.log(`Inizio upload ${fileType} su Appwrite:`, { uri, email, fileName });

            if (!this.isConfigured()) {
                throw new Error('Appwrite non è configurato correttamente');
            }

            if (onProgress) onProgress(5);

            // Definisci limiti in base al tipo di file
            const maxSize = fileType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB per video, 10MB per immagini

            // Crea il file object
            const file = await this.createFileFromUri(uri, fileName, maxSize);

            if (onProgress) onProgress(30);

            // Genera ID univoco per il file
            const fileId = ID.unique();

            if (onProgress) onProgress(40);

            console.log(`Caricamento ${fileType} su Appwrite Storage...`);
            // Upload diretto tramite SDK Appwrite
            const uploadedFile = await this.storage.createFile({
                bucketId: this.bucketId,
                fileId,
                file: {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uri: file.uri
                }
            })
            console.log(`${fileType} caricato con successo:`, uploadedFile);

            if (onProgress) onProgress(90);

            // Genera URL pubblico del file
            const fileUrl = this.storage.getFileView(this.bucketId, uploadedFile.$id);

            if (onProgress) onProgress(100);

            console.log('URL file generato:', fileUrl.toString());

            return {
                fileId: uploadedFile.$id,
                fileUrl: fileUrl.toString(),
                fileName: uploadedFile.name,
                size: uploadedFile.sizeOriginal,
                mimeType: uploadedFile.mimeType,
                success: true
            };

        } catch (error) {
            console.error(`Errore upload ${fileType}:`, error);

            // Gestione errori specifici di Appwrite
            if (error.code === 400) {
                throw new Error(`Dati ${fileType} non validi o formato non supportato.`);
            } else if (error.code === 401) {
                throw new Error('Errore di autenticazione. Verifica le credenziali.');
            } else if (error.code === 413) {
                throw new Error(`${fileType === 'video' ? 'Video' : 'File'} troppo grande per l'upload.`);
            } else if (error.code === 500) {
                throw new Error('Errore del server Appwrite. Riprova più tardi.');
            } else if (error.message?.includes('File size') || error.message?.includes('troppo grande')) {
                const maxSizeLabel = fileType === 'video' ? '50MB' : '10MB';
                throw new Error(`${fileType === 'video' ? 'Video' : 'File'} troppo grande per l'upload. Il limite è ${maxSizeLabel}.`);
            } else if (error.message?.includes('Network') || error.message?.includes('fetch')) {
                throw new Error('Errore di connessione. Verifica la tua connessione internet.');
            }

            throw error;
        }
    }

    // Upload immagine (wrapper del metodo generico)
    async uploadImage(uri, email, fileName, onProgress = null) {
        try {
            const isUpload = await this.uploadFile(uri, email, fileName, 'image', onProgress);
            if (isUpload && isUpload.success) {
                const url = await this.getSignedImageUrl(isUpload.fileId, this.bucketId);
                console.log('URL firmato ricevuto:', url);

                return url;
            }

            throw new Error('Upload immagine fallito');
        } catch (error) {
            throw error;
        }
    }

    // Upload video con controlli specifici
    async uploadVideo(uri, email, fileName, onProgress = null) {
        try {
            console.log('Inizio upload video su Appwrite:', { uri, email, fileName });

            // Controllo dimensione per video (limite più alto)
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error(`Video non trovato: ${uri}`);
            }

            const maxVideoSize = 50 * 1024 * 1024; // 50MB per video
            if (fileInfo.size > maxVideoSize) {
                throw new Error(`Il video è troppo grande (${(fileInfo.size / 1024 / 1024).toFixed(2)}MB). Il limite è 50MB.`);
            }

            // Usa lo stesso metodo uploadImage che gestisce tutti i tipi di file
            return await this.uploadImage(uri, email, fileName, onProgress);

        } catch (error) {
            console.error('Errore upload video:', error);
            throw error;
        }
    }

    // Elimina file tramite SDK Appwrite
    async deleteFile(fileId) {
        try {
            console.log('Eliminazione file da Appwrite:', fileId);

            if (!this.isConfigured()) {
                throw new Error('Appwrite non è configurato correttamente');
            }

            await this.storage.deleteFile(this.bucketId, fileId);

            console.log('File eliminato con successo:', fileId);
            return { success: true, fileId };

        } catch (error) {
            console.error('Errore eliminazione file:', error);

            if (error.code === 404) {
                throw new Error('File non trovato.');
            } else if (error.code === 401) {
                throw new Error('Non hai i permessi per eliminare questo file.');
            }

            throw error;
        }
    }

    // Ottieni informazioni file tramite SDK Appwrite
    async getFileInfo(fileId) {
        try {
            console.log('Recupero info file da Appwrite:', fileId);

            if (!this.isConfigured()) {
                throw new Error('Appwrite non è configurato correttamente');
            }

            const file = await this.storage.getFile(this.bucketId, fileId);

            console.log('Info file recuperate:', file);
            return file;

        } catch (error) {
            console.error('Errore recupero info file:', error);

            if (error.code === 404) {
                throw new Error('File non trovato.');
            }

            throw error;
        }
    }

    // Ottieni URL pubblico di un file
    async getSignedImageUrl(fileId, bucketId) {
        const response = await this.storage.createFileSignedUrl(bucketId, fileId);
        return response.url;
    }

    // Ottieni URL di download diretto
    async getFileDownloadUrl(fileId) {
        try {
            if (!this.isConfigured()) {
                throw new Error('Appwrite non è configurato correttamente');
            }

            const file = await storage.getFileDownload(bucketId, fileId);
            return file

        } catch (error) {
            console.error('Errore generazione URL download:', error);
            throw error;
        }
    }

    // Verifica se un file esiste
    async fileExists(fileId) {
        try {
            await this.getFileInfo(fileId);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Lista tutti i file nel bucket (con paginazione opzionale)
    async listFiles(limit = 25, offset = 0) {
        try {
            if (!this.isConfigured()) {
                throw new Error('Appwrite non è configurato correttamente');
            }

            const files = await this.storage.listFiles(
                this.bucketId,
                [], // queries (filtri)
                limit,
                offset
            );

            return files;

        } catch (error) {
            console.error('Errore lista files:', error);
            throw error;
        }
    }

    async getFileDownload(fileId) {
        try {
            const result = await storage.getFileDownload(this.bucketId, fileId);
            return result;
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    // Verifica se il servizio è configurato correttamente
    isConfigured() {
        return !!(this.bucketId && this.client);
    }

    // Ottieni informazioni sulla configurazione corrente
    getConfig() {
        return {
            endpoint: this.client.config?.endpoint,
            projectId: this.client.config?.project,
            bucketId: this.bucketId,
            configured: this.isConfigured()
        };
    }
}

// Export singleton
const appwriteService = new AppwriteService();
export default appwriteService;