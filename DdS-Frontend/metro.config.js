const { getDefaultConfig } = require('expo/metro-config');
const { Platform } = require('react-native');

const config = getDefaultConfig(__dirname);

// Add resolver options for web
if (Platform.OS === 'web') {
  config.resolver.blockList = [
    /node_modules\/react-native-maps\/lib\/.*/ 
  ];
}

module.exports = config;