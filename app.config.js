const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
const PRIVATE_KEY_ID = process.env.PRIVATE_KEY_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_KEY = process.env.API_KEY;
const MESSAGING_SENDER_ID = process.env.MESSAGING_SENDER_ID;
const APP_ID = process.env.APP_ID;
const KEYCHAIN_SERVICE = process.env.KEYCHAIN_SERVICE;
const ASYNC_STORAGE_KEY = process.env.ASYNC_STORAGE_KEY;
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID;
const APPWRITE_KEY = process.env.APPWRITE_KEY;
const PROXY_SERVER_URL = process.env.PROXY_SERVER_URL;
const SIGNEDIMAGE_URI = process.env.SIGNEDIMAGE_URI;
const TERMS_URL = process.env.TERMS_URL;
const SHOULD_HIDE_COMING_SOON_FEATURES = String(process.env.HIDE_COMING_SOON_FEATURES ?? "").toLowerCase();

export default {
    expo: {
        name: IS_DEV ? "ShentaoHub (Dev)" : IS_PREVIEW ? "ShentaoHub (Preview)" : "ShentaoHub",
        slug: "ShentaoHub",
        version: "1.1.0",
        orientation: "portrait",
        icon: "./assets/new-icon.png",
        userInterfaceStyle: "light",
        plugins: [
            [
                "expo-av",
                {
                    "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
                    "videoCameraUsageDescription": "Allow $(PRODUCT_NAME) to access your camera",
                }
            ],
            [
                "expo-media-library",
                {
                    "photosPermission": "Allow $(PRODUCT_NAME) to access your photos",
                    "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos",
                    "isAccessMediaLocationEnabled": true
                }
            ]
        ],
        // splash: {
        //     image: "./assets/new-splash.png",
        //     resizeMode: "contain", 
        //     backgroundColor: "#1a1a2e"
        // },
        extra: {
            myapp: "A.s.d. Shentao Scuola di Arti Marziali",
            eas: {
                projectId: "a8f731c8-8138-404e-8a86-fa9a9e19ccd9"
            },
            environment: IS_DEV ? "development" : IS_PREVIEW ? "preview" : "production",
            privateKeyId: PRIVATE_KEY_ID,
            privateKey: PRIVATE_KEY,
            apiKey: API_KEY,
            messagingSenderId: MESSAGING_SENDER_ID,
            appId: APP_ID,
            keychainService: KEYCHAIN_SERVICE,
            asyncStorageKey: ASYNC_STORAGE_KEY,
            appwriteEndpoint: APPWRITE_ENDPOINT,
            appwriteProjectId: APPWRITE_PROJECT_ID,
            appwriteBucketId: APPWRITE_BUCKET_ID,
            appwriteKey: APPWRITE_KEY,
            appwriteBundleId: IS_DEV ? "com.ShentHub.dev" : "com.ShentHub.shentao",
            proxyServerUrl: PROXY_SERVER_URL,
            signedImageUri: SIGNEDIMAGE_URI,
        },
        ios: {
            supportsTablet: true,
            infoPlist: {
                NSCameraUsageDescription: "This app needs access to the camera to take photos and videos",
                NSPhotoLibraryUsageDescription: "This app needs access to photos for sharing images and videos",
                NSPhotoLibraryAddUsageDescription: "This app needs access to photos to save images and videos",
                NSMicrophoneUsageDescription: "This app needs access to microphone for videos"
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#FFFFFF"
            },
            permissions: [
                "CAMERA",
                "RECORD_AUDIO",
                "READ_EXTERNAL_STORAGE",
                "WRITE_EXTERNAL_STORAGE",
                "MEDIA_LIBRARY"
            ],
            termsUrl: TERMS_URL,
            hideComingSoonFeatures: SHOULD_HIDE_COMING_SOON_FEATURES

        },

        jsEngine: "hermes",
        android: {
            jsEngine: "hermes",
            versionCode: 5,
            package: IS_DEV
                ? "com.ShentHub.dev"
                : "com.ShentHub.shentao",
            softwareKeyboardLayoutMode: "resize",
            adaptiveIcon: {
                foregroundImage: "./assets/shentao-logo.png",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "android.permission.CAMERA",
                "android.permission.RECORD_AUDIO",
                "android.permission.READ_MEDIA_IMAGES",
                "android.permission.READ_EXTERNAL_STORAGE",
                "android.permission.WRITE_EXTERNAL_STORAGE"
            ],
            permissionsInfoPlist: {
                "android.permission.CAMERA": "ShentaoHub richiede l'accesso alla fotocamera per permetterti di creare contenuti multimediali da condividere. Potrai scattare foto e registrare video per i tuoi post, le tue storie o aggiornare la tua immagine del profilo.",
                "android.permission.RECORD_AUDIO": "ShentaoHub richiede l'accesso al microfono per consentirti di registrare l'audio durante la creazione di video per i tuoi post e storie. Il microfono verrà utilizzato solo durante le registrazioni video.",
                "android.permission.READ_MEDIA_IMAGES": "ShentaoHub richiede l'accesso alla tua libreria foto per permetterti di selezionare e condividere i tuoi contenuti multimediali. Potrai scegliere foto e video da pubblicare nei post, nelle storie o come immagine del profilo.",
                "android.permission.READ_EXTERNAL_STORAGE": "ShentaoHub richiede l'accesso allo storage per permetterti di selezionare e condividere i tuoi contenuti multimediali.",
                "android.permission.WRITE_EXTERNAL_STORAGE": "ShentaoHub richiede l'accesso allo storage per salvare foto e video catturati nell'app."
            }
            ,
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 24,
            buildToolsVersion: "34.0.0"
        },
        ios: {
            jsEngine: "hermes",
            bundleIdentifier: IS_DEV
                ? "com.ShentHub.dev"
                : "com.ShentHub.shentao",
            supportsTablet: true,
            infoPlist: {
                NSCameraUsageDescription: "ShentaoHub richiede l'accesso alla fotocamera per permetterti di creare contenuti multimediali da condividere. Potrai scattare foto e registrare video per i tuoi post, le tue storie o aggiornare la tua immagine del profilo.",
                NSMicrophoneUsageDescription: "ShentaoHub richiede l'accesso al microfono per consentirti di registrare l'audio durante la creazione di video per i tuoi post e storie. Il microfono verrà utilizzato solo durante le registrazioni video.",
                NSPhotoLibraryUsageDescription: "ShentaoHub richiede l'accesso alla tua libreria foto per permetterti di selezionare e condividere i tuoi contenuti multimediali. Potrai scegliere foto e video da pubblicare nei post, nelle storie o come immagine del profilo.",
                NSPhotoLibraryAddUsageDescription: "ShentaoHub necessita di salvare foto e video nel tuo rullino dopo la registrazione o il download dei contenuti."
            }
        },

        plugins: [
            [
                "expo-camera",
                {
                    cameraPermission: "ShentaoHub needs access to your camera to let you capture photos and videos for sharing posts, stories, and updating your profile. The camera will only be used when you choose to take pictures or record videos."
                }
            ],
            [
                "expo-media-library",
                [
                    "expo-image-picker",
                    {
                        photosPermission: "ShentaoHub richiede l'accesso alla tua libreria foto per consentirti di selezionare e condividere foto/video nei post, storie e per personalizzare il tuo profilo. I tuoi contenuti saranno accessibili solo quando scegli di condividerli.",
                        cameraPermission: "ShentaoHub richiede l'accesso alla fotocamera per permetterti di catturare foto e video da condividere nei post, storie o come immagine del profilo. La fotocamera verrà utilizzata solo quando decidi di scattare."
                    }
                ]
            ],
            "expo-localization"
        ],

        assetBundlePatterns: [
            "**/*"
        ],
        cli: {
            version: ">= 7.3.0"
        },
        build: {
            development: {
                developmentClient: true,
                distribution: "internal"
            },
            preview: {
                distribution: "internal",
                ios: {
                    image: "macos-sonoma-14.5-xcode-15.4"
                }
            },
            production: {
                ios: {
                    image: "macos-sonoma-14.5-xcode-15.4"
                }
            }
        },
        submit: {
            production: {}
        },
        owner: "francesco04g",
        web: {
            favicon: "./assets/favicon.png"
        }
    }
};
