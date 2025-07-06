import "dotenv/config";

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
const PRIVATE_KEY_ID = process.env.PRIVATE_KEY_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_KEY = process.env.API_KEY;
const MESSAGING_SENDER_ID = process.env.MESSAGING_SENDER_ID;
const APP_ID = process.env.APP_ID;
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
        extra: {
            myapp: "A.s.d. Shentao Scuola di Arti Marziali (Company/Organization)",
            eas: {
                projectId: "5736e07f-f2a5-472c-9897-b0603e3201ac"
            },
            environment: IS_DEV ? "development" : IS_PREVIEW ? "preview" : "production",
            privateKeyId: PRIVATE_KEY_ID,
            privateKey: PRIVATE_KEY,
            apiKey: API_KEY,
            messagingSenderId: MESSAGING_SENDER_ID,
            appId: APP_ID
        },
        android: {
            package: IS_DEV
                ? "com.francesco04g.ShentaoHub.dev"
                : "com.hernanhawryluk.ShentaoHubcloneapp",
            adaptiveIcon: {
                foregroundImage: "./assets/shentao-logo.jpg",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "android.permission.CAMERA",
                "android.permission.RECORD_AUDIO",
                "android.permission.READ_EXTERNAL_STORAGE",
                "android.permission.WRITE_EXTERNAL_STORAGE"
            ]
        },
        ios: {
            bundleIdentifier: IS_DEV
                ? "com.francesco04g.ShentaoHub.dev"
                : "com.hernanhawryluk.ShentaoHubcloneapp",
            supportsTablet: true,
            infoPlist: {
                NSCameraUsageDescription: "Questa app ha bisogno di accedere alla fotocamera per scattare foto e video.",
                NSMicrophoneUsageDescription: "Questa app ha bisogno di accedere al microfono per registrare audio nei video.",
                NSPhotoLibraryUsageDescription: "Questa app ha bisogno di accedere alla libreria foto per selezionare immagini e video."
            }
        },
        web: {
            favicon: "./assets/new-favicon.png"
        },
        plugins: [
            "expo-camera",
            "expo-media-library",
            [
                "expo-image-picker",
                {
                    photosPermission: "L'app accede alle tue foto per permetterti di condividere immagini.",
                    cameraPermission: "L'app accede alla fotocamera per permetterti di scattare foto."
                }
            ]
        ]
    }
};