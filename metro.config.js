const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    extraNodeModules: {
      src: path.resolve(__dirname, 'src'), // Add 'src' alias
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
