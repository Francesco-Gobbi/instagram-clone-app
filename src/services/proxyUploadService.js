import * as FileSystem from 'expo-file-system/legacy';
import { auth } from '../services/firebase';
import Constants from 'expo-constants';

class ProxyUploadService {
    constructor() {
        this.baseUrl = Constants.expoConfig?.extra?.proxyServerUrl;

        if (!this.baseUrl) {
            console.warn('ProxyUploadService: URL del server proxy non configurato');
        }
    }

    async getFirebaseToken() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Utente non autenticato');
            }

            const token = await user.getIdToken();
            return token;
        } catch (error) {
            console.error('Errore recupero token Firebase:', error);
            throw error;
        }
    }

    async prepareFileForUpload(uri, fileName) {
        try {
            console.log('Preparazione file per upload:', { uri, fileName });

            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error(`File non trovato: ${uri}`);
            }

            console.log('File info:', fileInfo);

            let fileData;
            let mimeType = 'image/jpeg';

            if (fileName) {
                const lowerFileName = fileName.toLowerCase();
                if (lowerFileName.includes('.png')) {
                    mimeType = 'image/png';
                } else if (lowerFileName.includes('.jpg') || lowerFileName.includes('.jpeg')) {
                    mimeType = 'image/jpeg';
                } else if (lowerFileName.includes('.gif')) {
                    mimeType = 'image/gif';
                } else if (lowerFileName.includes('.png')) {
                    mimeType = 'image/webp';
                } else if (lowerFileName.includes('.mp4')) {
                    mimeType = 'video/mp4';
                } else if (lowerFileName.includes('.mov')) {
                    mimeType = 'video/quicktime';
                } else if (lowerFileName.includes('.avi')) {
                    mimeType = 'video/x-msvideo';
                }
            }

            if (uri.startsWith('file://')) {
                // File locale - leggi come base64 e converti in blob
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                if (!base64 || base64.length === 0) {
                    throw new Error('File vuoto o non leggibile');
                }

                // Converti base64 in blob
                const response = await fetch(`data:${mimeType};base64,${base64}`);
                fileData = await response.blob();

            } else if (uri.startsWith('content://') || uri.startsWith('ph://')) {
                // URI di sistema - converti tramite fetch
                const response = await fetch(uri);
                fileData = await response.blob();
                mimeType = fileData.type || mimeType;

            } else if (uri.startsWith('http://') || uri.startsWith('https://')) {
                // URL remoto
                const response = await fetch(uri);
                fileData = await response.blob();
                mimeType = fileData.type || mimeType;
            } else {
                // Altri tipi di URI
                try {
                    const response = await fetch(uri);
                    fileData = await response.blob();
                    mimeType = fileData.type || mimeType;
                } catch (fetchError) {
                    console.error('Errore fetch URI:', fetchError);
                    throw new Error(`Impossibile caricare il file dall'URI: ${uri}`);
                }
            }

            if (!fileData || fileData.size === 0) {
                throw new Error('Il file è vuoto (0 bytes)');
            }

            console.log('File preparato:', {
                size: fileData.size,
                type: mimeType,
                fileName: fileName
            });

            return {
                blob: fileData,
                size: fileData.size,
                type: mimeType
            };

        } catch (error) {
            console.error('Errore preparazione file:', error);
            throw error;
        }
    }

    // Upload file tramite server proxy
    async uploadImage(uri, email, fileName, onProgress = null) {
        try {
            console.log('Inizio upload diretto su Appwrite:', { uri, email, fileName });

            if (!this.isConfigured()) {
                throw new Error('Appwrite non è configurato correttamente');
            }

            if (onProgress) onProgress(5);

            // Verifica file
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error(`File non trovato: ${uri}`);
            }

            const maxSize = 10 * 1024 * 1024; // 10MB
            if (fileInfo.size > maxSize) {
                throw new Error(`Il file è troppo grande (${(fileInfo.size / 1024 / 1024).toFixed(2)}MB). Il limite è 10MB.`);
            }

            if (onProgress) onProgress(30);

            // Leggi il file come base64
            const base64Data = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            if (!base64Data || base64Data.length === 0) {
                throw new Error('File vuoto o non leggibile');
            }

            if (onProgress) onProgress(50);

            const mimeType = this.getMimeType(fileName);

            // Converti base64 in Blob usando fetch
            const response = await fetch(`data:${mimeType};base64,${base64Data}`);
            const blob = await response.blob();

            // Crea File object corretto per Appwrite
            const file = new File([blob], fileName || `upload_${Date.now()}`, {
                type: mimeType,
                lastModified: Date.now()
            });

            if (onProgress) onProgress(70);

            const fileId = ID.unique();

            // Upload con File object
            const uploadedFile = await this.storage.createFile(
                this.bucketId,
                fileId,
                file,
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.any())
                ]
            );

            if (onProgress) onProgress(90);

            const fileUrl = this.storage.getFileView(this.bucketId, uploadedFile.$id);

            if (onProgress) onProgress(100);

            return {
                fileId: uploadedFile.$id,
                fileUrl: fileUrl.toString(),
                fileName: uploadedFile.name,
                size: uploadedFile.sizeOriginal,
                mimeType: uploadedFile.mimeType,
                success: true
            };

        } catch (error) {
            console.error('Errore upload Appwrite:', error);

            if (error.code === 400) {
                throw new Error('Dati file non validi o formato non supportato.');
            } else if (error.code === 401) {
                throw new Error('Errore di autenticazione. Verifica le credenziali.');
            } else if (error.code === 413) {
                throw new Error('File troppo grande per l\'upload.');
            }

            throw error;
        }
    }

    // Upload video tramite server proxy (con controlli aggiuntivi)
    async uploadVideo(uri, email, fileName, onProgress = null) {
        try {
            console.log('Inizio upload video tramite proxy:', { uri, email, fileName });

            // I video potrebbero richiedere più tempo, aumentiamo il timeout
            // Usa lo stesso metodo uploadImage che già gestisce diversi tipi di file
            return await this.uploadImage(uri, email, fileName, onProgress);

        } catch (error) {
            console.error('Errore upload video:', error);
            throw error;
        }
    }

    // Elimina file tramite server proxy
    async deleteFile(fileId) {
        try {
            console.log('Eliminazione file tramite proxy:', fileId);

            if (!this.baseUrl) {
                throw new Error('URL del server proxy non configurato');
            }

            const firebaseToken = await this.getFirebaseToken();

            const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${firebaseToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorMessage = `Server error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.warn('Impossibile parsare la risposta di errore:', parseError);
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('File eliminato tramite proxy:', result);
            return result;

        } catch (error) {
            console.error('Errore eliminazione file:', error);
            throw error;
        }
    }

    // Ottieni informazioni file tramite server proxy
    async getFileInfo(fileId) {
        try {
            console.log('Recupero info file tramite proxy:', fileId);

            if (!this.baseUrl) {
                throw new Error('URL del server proxy non configurato');
            }

            const firebaseToken = await this.getFirebaseToken();

            const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${firebaseToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorMessage = `Server error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    console.warn('Impossibile parsare la risposta di errore:', parseError);
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Info file recuperate tramite proxy:', result);
            return result;

        } catch (error) {
            console.error('Errore recupero info file:', error);
            throw error;
        }
    }

    // Verifica se il servizio è configurato correttamente
    isConfigured() {
        return !!this.baseUrl;
    }

    // Ottieni l'URL base del servizio
    getBaseUrl() {
        return this.baseUrl;
    }
}

const proxyUploadService = new ProxyUploadService();
export default proxyUploadService;