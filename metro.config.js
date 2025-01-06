// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig: getDefaultExpoConfig } = require("expo/metro-config");
const { mergeConfig, getDefaultConfig } = require("@react-native/metro-config");
const exclusionList = require('metro-config/src/defaults/exclusionList');

/** @type {import('expo/metro-config').MetroConfig} */
const expoConfig = getDefaultExpoConfig(__dirname);
const defaultConfig = getDefaultConfig(__dirname);

const { assetExts, sourceExts } = expoConfig.resolver;

const config = {
  transformer: {
    ...expoConfig.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  },
  resolver: {
    blacklistRE: exclusionList([
      new RegExp("^\\/Users\\/andrewdunn\\/Documents\\/GitHubDunn\\/EighteenApp\\/.git\\/.*$"),
      // ...
    ]),
    ...expoConfig.resolver,
    assetExts: assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...sourceExts, "svg"],
  },
};

module.exports = mergeConfig(defaultConfig, expoConfig, config);
