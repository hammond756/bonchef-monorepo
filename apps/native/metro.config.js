const { withNativeWind } = require('nativewind/metro');
const { withShareExtension } = require("expo-share-extension/metro");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");
 
const config = getSentryExpoConfig(__dirname)
 
module.exports = withNativeWind(withShareExtension(config), { input: './global.css' })