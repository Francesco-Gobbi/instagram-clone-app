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

export default {
    expo: {
        name: IS_DEV ? "ShentaoHub (Dev)" : IS_PREVIEW ? "ShentaoHub (Preview)" : "ShentaoHub",
        slug: "ShentaoHub",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/new-icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/new-splash.png",
            resizeMode: "contain",
            backgroundColor: "#1a1a2e"
        },
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
            proxyServerUrl: PROXY_SERVER_URL,
            signedImageUri: SIGNEDIMAGE_URI

        },

        jsEngine: "hermes",
        android: {
            jsEngine: "hermes",
            package: IS_DEV
                ? "com.ShentHub.dev"
                : "com.ShentHub.shentao",
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
            ]
        },
        ios: {
            jsEngine: "hermes",
            bundleIdentifier: IS_DEV
                ? "com.ShentHub.dev"
                : "com.ShentHub.shentao",
            supportsTablet: true,
            infoPlist: {
                NSCameraUsageDescription: "Questa app ha bisogno di accedere alla fotocamera per scattare foto e video.",
                NSMicrophoneUsageDescription: "Questa app ha bisogno di accedere al microfono per registrare audio nei video.",
                NSPhotoLibraryUsageDescription: "Questa app ha bisogno di accedere alla libreria foto per selezionare immagini e video."
            }
        },

        plugins: [
            [
                "expo-camera",
                {
                    cameraPermission: "Allow access to your camera"
                }
            ],
            [
                "expo-media-library",
                [
                    "expo-image-picker",
                    {
                        photosPermission: "L'app accede alle tue foto per permetterti di condividere immagini.",
                        cameraPermission: "L'app accede alla fotocamera per permetterti di scattare foto."
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