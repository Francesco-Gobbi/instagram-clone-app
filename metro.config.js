// const { getDefaultConfig } = require('expo/metro-config');

// const config = getDefaultConfig(__dirname);

// // Aggiungi i polyfill per i moduli Node.js
// config.resolver.alias = {
//     ...config.resolver.alias,
//     'assert': require.resolve('assert'),
//     'crypto': require.resolve('crypto-browserify'),
//     'stream': require.resolve('stream-browserify'),
//     'buffer': require.resolve('buffer'),
//     'fs': require.resolve('fs'),
//     'path': require.resolve('path-browserify')
// };

// // Configura i globals per i polyfill
// config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// module.exports = config;

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configura gli asset
config.resolver.assetExts = [
    ...config.resolver.assetExts,
    'png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'
];

// Configura le piattaforme
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configura il transformer per gli asset
config.transformer = {
    ...config.transformer,
    assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
};

module.exports = config;