module.exports = function(api) {
api.cache(true);
return {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      "module:react-native-dotenv",
      {
        moduleName: "@env",
        path: ".env",
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    [
      'react-native-reanimated/plugin',
      {
        globals: ['__example_plugin', '__example_plugin_swift', '__scanCodes'],
      },
    ],
  ],
};
};