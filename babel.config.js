module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove 'expo-router/babel' and use this instead:
      'expo-router/babel-preset',
      'react-native-reanimated/plugin',
    ],
  };
};