import * as FileSystem from 'expo-file-system';
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

    // Prepara il file per l'upload
    async prepareFileForUpload(uri, fileName) {
        try {
            console.log('Preparazione file per upload:', { uri, fileName });

            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error(`File non trovato: ${uri}`);
            }

            console.log('File info:', fileInfo);

            let fileData;
            let mimeType = 'image/jpeg'; // Default

            if (uri.startsWith('file://')) {
                // File locale - leggi come base64 e converti in blob
                const base64 = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                if (!base64 || base64.length === 0) {
                    throw new Error('File vuoto o non leggibile');
                }

                // Determina il tipo MIME dal nome file
                if (fileName.toLowerCase().includes('.png')) {
                    mimeType = 'image/png';
                } else if (fileName.toLowerCase().includes('.jpg') || fileName.toLowerCase().includes('.jpeg')) {
                    mimeType = 'image/jpeg';
                } else if (fileName.toLowerCase().includes('.gif')) {
                    mimeType = 'image/gif';
                } else if (fileName.toLowerCase().includes('.webp')) {
                    mimeType = 'image/webp';
                }

                // Converti base64 in blob
                const response = await fetch(`data:${mimeType};base64,${base64}`);
                fileData = await response.blob();

            } else if (uri.startsWith('content://') || uri.startsWith('ph://')) {
                // URI di sistema - converti tramite fetch
                const response = await fetch(uri);
                fileData = await response.blob();
                mimeType = fileData.type || mimeType;

            } else {
                // URL remoto
                const response = await fetch(uri);
                fileData = await response.blob();
                mimeType = fileData.type || mimeType;
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
            console.log('Inizio upload tramite proxy:', { uri, email, fileName });

            if (!this.baseUrl) {
                throw new Error('URL del server proxy non configurato');
            }

            // Simula progresso iniziale
            if (onProgress) {
                onProgress(5);
            }

            // Ottieni token Firebase
            const firebaseToken = await this.getFirebaseToken();

            if (onProgress) {
                onProgress(15);
            }

            // Prepara il file
            const fileData = await this.prepareFileForUpload(uri, fileName);

            if (onProgress) {
                onProgress(30);
            }

            // Crea FormData per l'upload
            const formData = new FormData();
            formData.append('image', fileData.blob, fileName);
            formData.append('email', email);
            formData.append('mimeType', fileData.type);

            if (onProgress) {
                onProgress(40);
            }

            // Configura la richiesta
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${firebaseToken}`,
                    // Non impostare Content-Type per FormData - viene gestito automaticamente
                },
                body: formData,
            };

            console.log('Invio richiesta al server proxy...');

            if (onProgress) {
                onProgress(60);
            }

            // Esegui l'upload
            const response = await fetch(`${this.baseUrl}/upload`, requestOptions);

            if (onProgress) {
                onProgress(80);
            }

            if (!response.ok) {
                let errorMessage = `Server error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    // Se non riesce a parsare la risposta, usa il messaggio di default
                    console.warn('Impossibile parsare la risposta di errore:', parseError);
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            console.log('Upload completato tramite proxy:', result);

            // Progresso completato
            if (onProgress) {
                onProgress(100);
            }

            // Verifica che la risposta contenga l'URL del file
            if (!result.fileUrl && !result.url) {
                throw new Error('Risposta del server non valida: URL file mancante');
            }

            return result.fileUrl || result.url;

        } catch (error) {
            console.error('Errore upload tramite proxy:', error);

            // Gestisci errori specifici
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                throw new Error('Errore di autenticazione. Riprova ad accedere.');
            } else if (error.message.includes('413') || error.message.includes('File size')) {
                throw new Error('Il file è troppo grande per essere caricato.');
            } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
                throw new Error('Dati file non validi.');
            } else if (error.message.includes('500') || error.message.includes('Internal Server')) {
                throw new Error('Errore del server. Riprova più tardi.');
            } else if (error.message.includes('Network')) {
                throw new Error('Errore di connessione. Verifica la tua connessione internet.');
            }

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