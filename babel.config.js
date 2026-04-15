module.exports = function (api) {
  api.cache(true);
  return {
    // Disable preset-injected worklets, then add the plugin here so it runs after the RN/TS
    // transforms from the preset (see babel-preset-expo nested preset order). Relying only on
    // the preset left worklets out of the effective pipeline → WorkletsError at runtime.
    presets: [['babel-preset-expo', { worklets: false, reanimated: false }]],
    plugins: [require.resolve('react-native-worklets/plugin')],
  };
};
