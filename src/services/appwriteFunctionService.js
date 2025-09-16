import * as FileSystem from 'expo-file-system';
import { auth } from '../services/firebase';

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
            // Verifica che il file esista
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error(`File non trovato: ${uri}`);
            }

            console.log('File info:', fileInfo);

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
            } else {
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

            const response = await fetch(this.functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': this.projectId,
                },
                body: JSON.stringify(payload)
            });

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

            return JSON.parse(result.response);

        } catch (error) {
            console.error('Errore esecuzione Function:', error);
            throw error;
        }
    }

    // Upload immagine tramite Appwrite Function
    async uploadImage(uri, email, fileName, onProgress = null) {
        try {
            console.log('Upload via Appwrite Function:', { uri, email, fileName });

            // Converti file in base64
            const imageData = await this.fileToBase64(uri);

            // Prepara i dati per la function
            const uploadData = {
                imageData: imageData,
                fileName: fileName,
                email: email,
                timestamp: Date.now()
            };

            // Simula progresso all'inizio
            if (onProgress) {
                onProgress(10);
            }

            // Esegui upload tramite function
            const result = await this.executeFunction('POST', '/upload', uploadData);

            // Simula progresso completato
            if (onProgress) {
                onProgress(100);
            }

            console.log('Upload completato via Function:', result);

            if (!result.success) {
                throw new Error(result.error || 'Upload fallito');
            }

            return result.fileUrl;

        } catch (error) {
            console.error('Errore upload Function:', error);

            // Gestisci errori specifici
            if (error.message?.includes('Token')) {
                throw new Error('Errore di autenticazione. Riprova ad accedere.');
            } else if (error.message?.includes('File size') || error.message?.includes('413')) {
                throw new Error('Il file è troppo grande per essere caricato.');
            } else if (error.message?.includes('400')) {
                throw new Error('Dati file non validi.');
            } else if (error.message?.includes('500')) {
                throw new Error('Errore del server. Riprova più tardi.');
            }

            throw error;
        }
    }

    // Elimina file tramite Appwrite Function
    async deleteFile(fileId) {
        try {
            console.log('Eliminazione file via Function:', fileId);

            const result = await this.executeFunction('DELETE', `/files/${fileId}`);

            if (!result.success) {
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
}

const appwriteFunctionService = new AppwriteFunctionService();
export default appwriteFunctionService;