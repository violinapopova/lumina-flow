const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.resolver.sourceExts.push('mjs');

const srcRoot = path.join(projectRoot, 'src');

/**
 * Path aliases (same as tsconfig paths). Kept in Metro so Babel does not need
 * `babel-plugin-module-resolver`, which would run before babel-preset-expo and break
 * react-native-worklets (must stay last). See Reanimated troubleshooting.
 */
function mapAliasToAbsolute(moduleName) {
  if (moduleName.startsWith('@/')) {
    return path.join(srcRoot, moduleName.slice(2));
  }
  if (moduleName === '@theme') {
    return path.join(srcRoot, 'theme');
  }
  if (moduleName.startsWith('@theme/')) {
    return path.join(srcRoot, 'theme', moduleName.slice('@theme/'.length));
  }
  if (moduleName === '@components') {
    return path.join(srcRoot, 'components');
  }
  if (moduleName.startsWith('@components/')) {
    return path.join(srcRoot, 'components', moduleName.slice('@components/'.length));
  }
  if (moduleName.startsWith('@screens/')) {
    return path.join(srcRoot, 'screens', moduleName.slice('@screens/'.length));
  }
  if (moduleName.startsWith('@navigation/')) {
    return path.join(srcRoot, 'navigation', moduleName.slice('@navigation/'.length));
  }
  if (moduleName.startsWith('@store/')) {
    return path.join(srcRoot, 'store', moduleName.slice('@store/'.length));
  }
  if (moduleName.startsWith('@hooks/')) {
    return path.join(srcRoot, 'hooks', moduleName.slice('@hooks/'.length));
  }
  if (moduleName.startsWith('@utils/')) {
    return path.join(srcRoot, 'utils', moduleName.slice('@utils/'.length));
  }
  return null;
}

// Chain with Metro default: inside resolveRequest, context.resolveRequest is the core resolver
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const mapped = mapAliasToAbsolute(moduleName);
  if (mapped) {
    return context.resolveRequest(context, mapped, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
