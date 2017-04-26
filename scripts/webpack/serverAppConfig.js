// Require modules
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

// Build settings
const settings = require('./settings.js');

// Webpack config
function getConfig(localeCode, browserAppFilename) {
	const publicPath = `/${localeCode}/`;
	const config = {
		entry: {
			'server-app': [settings.serverAppEntryPath]
		},

		output: {
			libraryTarget: 'commonjs2',
			path: path.join(settings.serverAppOutputPath, localeCode),
			filename: '[name].js',
			publicPath
		},

		devtool: 'eval',

		module: {
			rules: [
				{
					test: /\.jsx?$/,
					include: [
						settings.appPath,
						settings.webComponentsSrcPath,
					],
					loader: 'babel-loader',
				},

				{
					test: /\.css$/,
					include: [settings.cssPath],
					use: [
						'style-loader',
						'css-loader',
					],
				},
			]
		},

		plugins: [
			new webpack.DefinePlugin({
				// server bundles must reference _browser_ bundle public path
				// - inject it as a 'global variable' here
				WEBPACK_BROWSER_APP_FILENAME: JSON.stringify(browserAppFilename),
				WEBPACK_BASE_URL: JSON.stringify(localeCode === 'en-US' ? '' : `/${localeCode}/`),
				WEBPACK_ASSET_PUBLIC_PATH: JSON.stringify(publicPath),
				IS_DEV: settings.isDev,
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			}),
		],

		target: 'node',

		externals: [ nodeExternals({
			modulesDir : process.env.NODE_PATH ? process.env.NODE_PATH : null,
			whitelist: [/^meetup-web-components/],
		})],

		resolveLoader: {
			alias: {
				'require-loader': path.resolve(settings.utilsPath, 'require-loader.js')
			}
		},

		resolve: {
			alias: {
				src: settings.appPath,
			},
			// module name extensions
			extensions: ['.js', '.jsx', '.json']
		}
	};
	if (!settings.isDev) {
		config.plugins = config.plugins.concat(settings.prodPlugins);
	}
	return config;
}

// export the config-building function for programmatic consumption
module.exports = getConfig;

