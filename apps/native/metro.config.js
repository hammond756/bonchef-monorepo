const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const { withShareExtension } = require("expo-share-extension/metro");
 
const config = getDefaultConfig(__dirname)
 
module.exports = withNativeWind(withShareExtension(config), { input: './global.css' })
