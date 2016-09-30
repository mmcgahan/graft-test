const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const appPath = path.resolve(repoRoot, 'src');
const outPath = path.resolve(repoRoot, 'build');

module.exports = {
	appPath,
	assetPath: path.resolve(appPath, 'assets'),
	clientEntryPath: path.resolve(appPath, 'client.js'),
	clientOutputPath: path.resolve(outPath, 'client-locales'),
	outPath,
	platformPath: /node_modules\/meetup-web-platform/,
	serverEntryPath: path.resolve(repoRoot, 'scripts', 'app-server.js'),
	serverOutputPath: path.resolve(outPath, 'server-locales'),
	serverLocalesModulePath: path.resolve(outPath, 'server-locales', 'serverLocaleMap.js'),
	serverLocaleEntryPath: path.resolve(appPath, 'server-locale.js'),
	utilsPath: path.resolve(repoRoot, 'utils'),

	isProduction: process.env.NODE_ENV === 'production',

	localeCodes: [
		'en-US',
	]
};
