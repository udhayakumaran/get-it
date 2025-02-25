const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS support for web
  isCSSEnabled: true,
});

// Configure asset extensions
config.resolver.assetExts = [...config.resolver.assetExts, 'ttf'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;