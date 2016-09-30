// Require modules
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

// Build settings
const settings = require('./settings.js');

// Webpack config
function getConfig(localeCode, clientFilename) {
	const publicPath = `/${localeCode}/`;
	return {
		entry: {
			'server-locale': [settings.serverLocaleEntryPath]
		},

		output: {
			libraryTarget: 'commonjs2',
			path: path.join(settings.serverOutputPath, localeCode),
			filename: '[name].js',
			publicPath
		},

		devtool: settings.isProduction ? 'source-map' : 'eval',

		module: {
			loaders: [
				{
					test: /\.jsx?$/,
					include: [
						settings.appPath,
						settings.platformPath,
					],
					loader: 'babel-loader',
				},

				{
					test: /\.json$/,
					include: [
						settings.appPath,
					],
					loader: 'json'
				}
			]
		},

		plugins: [
			new webpack.DefinePlugin({
				// server bundles must reference _client_ bundle public path
				// - inject it as a 'global variable' here
				WEBPACK_CLIENT_FILENAME: JSON.stringify(clientFilename),
				WEBPACK_ASSET_PUBLIC_PATH: JSON.stringify(publicPath),
			}),
		],

		target: 'node',

		externals: [ nodeExternals({
			modulesDir : process.env.NODE_PATH ? process.env.NODE_PATH : null,
			whitelist: [/^meetup-web-platform/],
		})],

		resolveLoader: {
			alias: {
				'require-loader': path.resolve(settings.utilsPath, 'require-loader.js')
			}
		},

		resolve: {
			// module name extensions
			extensions: ['.js', '.jsx']
		}
	};
}

// export the config-building function for programmatic consumption
module.exports = getConfig;

