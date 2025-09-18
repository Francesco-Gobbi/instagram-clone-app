import * as FileSystem from 'expo-file-system/legacy';
import { auth } from '../services/firebase';
import Constants from 'expo-constants';

class AppwriteFunctionService {
    constructor() {
        this.functionUrl = Constants.expoConfig?.extra?.appwriteFunctionUrl;
        this.projectId = Constants.expoConfig?.extra?.appwriteProjectId;
    }

    // Ottieni il token Firebase dell'utente corrente
    async getFirebaseToken() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Utente non autenticato su Firebase');
            }

            const token = await user.getIdToken();
            return token;
        } catch (error) {
            console.error('Errore recupero token Firebase:', error);
            throw error;
        }
    }

    // Converti file in base64
    async fileToBase64(uri) {
        try {
            // Usa l'API legacy di FileSystem
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error(`File non trovato: ${uri}`);
            }

            console.log('File info:', fileInfo);

            // Controlla la dimensione del file prima di convertirlo
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (fileInfo.size > maxSize) {
                throw new Error(`Il file è troppo grande (${(fileInfo.size / 1024 / 1024).toFixed(2)}MB). Il limite è 10MB.`);
            }

            let base64Data;

            if (uri.startsWith('file://')) {
                // File locale - leggi direttamente come base64
                base64Data = await FileSystem.readAsStringAsync(uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
            } else if (uri.startsWith('content://') || uri.startsWith('ph://')) {
                // URI di sistema - converti tramite fetch
                const response = await fetch(uri);
                const blob = await response.blob();

                // Converti blob in base64
                const reader = new FileReader();
                base64Data = await new Promise((resolve, reject) => {
                    reader.onload = () => {
                        const result = reader.result;
                        // Rimuovi il prefixo data URL se presente
                        const base64 = result.includes(',') ? result.split(',')[1] : result;
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } else if (uri.startsWith('http://') || uri.startsWith('https://')) {
                // URL remoto
                const response = await fetch(uri);
                const blob = await response.blob();

                const reader = new FileReader();
                base64Data = await new Promise((resolve, reject) => {
                    reader.onload = () => {
                        const result = reader.result;
                        const base64 = result.includes(',') ? result.split(',')[1] : result;
                        resolve(base64);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } else {
                // Altri tipi di URI
                try {
                    const response = await fetch(uri);
                    const blob = await response.blob();

                    const reader = new FileReader();
                    base64Data = await new Promise((resolve, reject) => {
                        reader.onload = () => {
                            const result = reader.result;
                            const base64 = result.includes(',') ? result.split(',')[1] : result;
                            resolve(base64);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                } catch (fetchError) {
                    console.error('Errore fetch URI:', fetchError);
                    throw new Error(`Impossibile caricare il file dall'URI: ${uri}`);
                }
            }

            if (!base64Data || base64Data.length === 0) {
                throw new Error('Conversione base64 fallita - file vuoto');
            }

            console.log('Base64 generato, lunghezza:', base64Data.length);
            return base64Data;

        } catch (error) {
            console.error('Errore conversione base64:', error);
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
        } else if (lowerFileName.includes('.png')) {
            return 'image/webp';
        } else if (lowerFileName.includes('.mp4')) {
            return 'video/mp4';
        } else if (lowerFileName.includes('.mov')) {
            return 'video/quicktime';
        } else if (lowerFileName.includes('.avi')) {
            return 'video/x-msvideo';
        }

        return 'application/octet-stream'; // Default generico
    }

    // Esegui chiamata alla Appwrite Function
    async executeFunction(method, path, data = null) {
        try {
            const firebaseToken = await this.getFirebaseToken();

            const payload = {
                method: method,
                path: path,
                headers: {
                    'Authorization': `Bearer ${firebaseToken}`,
                    'Content-Type': 'application/json'
                },
                body: data ? JSON.stringify(data) : undefined
            };

            console.log('Esecuzione Appwrite Function:', { method, path });

            // Timeout appropriato per file grandi
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 secondi

            const response = await fetch(this.functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': this.projectId,
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Errore risposta Function:', response.status, errorText);
                throw new Error(`Function error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            // Appwrite Functions restituiscono il risultato in result.response
            if (result.errors) {
                throw new Error(`Function execution error: ${result.errors}`);
            }

            // Prova a parsare la risposta se è una stringa JSON
            try {
                return typeof result.response === 'string' ? JSON.parse(result.response) : result.response;
            } catch (parseError) {
                // Se non è JSON valido, ritorna come stringa
                return result.response;
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Richiesta annullata: timeout raggiunto');
            }
            console.error('Errore esecuzione Function:', error);
            throw error;
        }
    }

    // Upload immagine tramite Appwrite Function
    async uploadImage(uri, email, fileName, onProgress = null) {
        try {
            console.log('Upload via Appwrite Function:', { uri, email, fileName });

            // Simula progresso all'inizio
            if (onProgress) {
                onProgress(10);
            }

            // Converti file in base64
            const imageData = await this.fileToBase64(uri);

            if (onProgress) {
                onProgress(30);
            }

            // Determina il tipo MIME
            const mimeType = this.getMimeType(fileName);

            // Prepara i dati per la function
            const uploadData = {
                imageData: imageData,
                fileName: fileName,
                email: email,
                mimeType: mimeType,
                timestamp: Date.now()
            };

            if (onProgress) {
                onProgress(50);
            }

            // Esegui upload tramite function
            const result = await this.executeFunction('POST', '/upload', uploadData);

            // Simula progresso completato
            if (onProgress) {
                onProgress(100);
            }

            console.log('Upload completato via Function:', result);

            if (!result.success && !result.fileUrl && !result.url) {
                throw new Error(result.error || 'Upload fallito');
            }

            return result.fileUrl || result.url || result;

        } catch (error) {
            console.error('Errore upload Function:', error);

            // Gestisci errori specifici
            if (error.message?.includes('Token')) {
                throw new Error('Errore di autenticazione. Riprova ad accedere.');
            } else if (error.message?.includes('File size') || error.message?.includes('413') || error.message?.includes('troppo grande')) {
                throw new Error('Il file è troppo grande per essere caricato.');
            } else if (error.message?.includes('400')) {
                throw new Error('Dati file non validi.');
            } else if (error.message?.includes('500')) {
                throw new Error('Errore del server. Riprova più tardi.');
            } else if (error.message?.includes('timeout')) {
                throw new Error('Upload annullato: tempo scaduto. Il file potrebbe essere troppo grande.');
            }

            throw error;
        }
    }

    // Upload video tramite Appwrite Function (con controlli aggiuntivi per file grandi)
    async uploadVideo(uri, email, fileName, onProgress = null) {
        try {
            console.log('Upload video via Appwrite Function:', { uri, email, fileName });

            // Per i video, controlla prima la dimensione
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error(`Video non trovato: ${uri}`);
            }

            const maxVideoSize = 50 * 1024 * 1024; // 50MB per i video
            if (fileInfo.size > maxVideoSize) {
                throw new Error(`Il video è troppo grande (${(fileInfo.size / 1024 / 1024).toFixed(2)}MB). Il limite è 50MB.`);
            }

            // Usa lo stesso metodo uploadImage che gestisce tutti i tipi di file
            return await this.uploadImage(uri, email, fileName, onProgress);

        } catch (error) {
            console.error('Errore upload video Function:', error);
            throw error;
        }
    }

    // Elimina file tramite Appwrite Function
    async deleteFile(fileId) {
        try {
            console.log('Eliminazione file via Function:', fileId);

            const result = await this.executeFunction('DELETE', `/files/${fileId}`);

            if (!result.success && result.error) {
                throw new Error(result.error || 'Eliminazione fallita');
            }

            return result;

        } catch (error) {
            console.error('Errore eliminazione Function:', error);
            throw error;
        }
    }

    // Ottieni info file tramite Appwrite Function
    async getFileInfo(fileId) {
        try {
            console.log('Recupero info file via Function:', fileId);

            const result = await this.executeFunction('GET', `/files/${fileId}`);

            return result;

        } catch (error) {
            console.error('Errore recupero info Function:', error);
            throw error;
        }
    }

    // Verifica se il servizio è configurato
    isConfigured() {
        return !!(this.functionUrl && this.projectId);
    }
}

const appwriteFunctionService = new AppwriteFunctionService();
export default appwriteFunctionService;