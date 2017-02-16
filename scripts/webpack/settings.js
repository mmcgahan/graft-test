const path = require('path');
const webpack = require('webpack');

const repoRoot = path.resolve(__dirname, '..', '..');
const appPath = path.resolve(repoRoot, 'src');
const outPath = path.resolve(repoRoot, 'build');

module.exports = {
	repoRoot,
	appPath,
	assetPath: path.resolve(appPath, 'assets'),
	browserAppEntryPath: path.resolve(appPath, 'browser-app-entry.js'),
	browserAppOutputPath: path.resolve(outPath, 'browser-app'),
	cssPath: path.resolve(appPath, 'assets', 'css'),
	webComponentsSrcPath: /node_modules\/meetup-web-components\/src/,
	webComponentsIconsPath: /node_modules\/meetup-web-components\/icons/,
	outPath,
	serverEntryPath: path.resolve(repoRoot, 'scripts', 'app-server.js'),
	serverOutputPath: outPath,
	serverAppModulePath: path.resolve(outPath, 'server-app', 'serverAppMap.js'),
	serverAppEntryPath: path.resolve(appPath, 'server-app-entry.js'),
	serverAppOutputPath: path.resolve(outPath, 'server-app'),
	serviceWorkerEntryPath: path.resolve(appPath, 'sw.js'),
	serviceWorkerOutputPath: path.resolve(outPath, 'sw'),
	trnsPath: path.resolve(appPath, 'trns'),
	utilsPath: path.resolve(repoRoot, 'util'),

	isDev: process.env.NODE_ENV !== 'production',
	enableHMR: process.env.NODE_ENV !== 'production' && !process.env.DISABLE_HMR,
	prodPlugins: [
		// Removes duplicate module code (rare, but can happen)
		new webpack.optimize.DedupePlugin(),

		// Tells loaders to optimize what they can since in minimize mode
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			debug: false,
			quiet: true
		}),

		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			output: {
				comments: false
			}
		}),
	],

	localeCodes: [
		'en-US',
	]
};
