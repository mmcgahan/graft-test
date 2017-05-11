// Require modules
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const buildConfig = require('meetup-web-platform/lib/util/config/build')
	.default;

// Build settings
const settings = require('./settings.js');

// Webpack config
function getConfig(localeCode, browserAppFilename) {
	const publicPath = `/${localeCode}/`;
	const config = {
		entry: {
			'server-app': [settings.serverAppEntryPath],
		},

		output: {
			libraryTarget: 'commonjs2',
			path: path.join(settings.serverAppOutputPath, localeCode),
			filename: '[name].js',
			publicPath,
		},

		devtool: 'eval',

		module: {
			rules: [
				{
					test: /\.jsx?$/,
					include: [settings.appPath, settings.webComponentsSrcPath],
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
					},
				},
				{
					test: /\.css$/,
					include: [settings.cssPath],
					use: ['style-loader', 'css-loader'],
				},
			],
		},

		plugins: [
			new webpack.EnvironmentPlugin({
				NODE_ENV: 'development', // required for prod build of React
			}),
			new webpack.DefinePlugin({
				// server bundles must reference _browser_ bundle public path
				// - inject it as a 'global variable' here
				WEBPACK_BROWSER_APP_FILENAME: JSON.stringify(browserAppFilename),
				WEBPACK_BASE_URL: JSON.stringify(
					localeCode === 'en-US' ? '' : `/${localeCode}`
				),
				WEBPACK_ASSET_PUBLIC_PATH: JSON.stringify(publicPath),
			}),
		],

		target: 'node',

		externals: [
			nodeExternals({
				modulesDir: process.env.NODE_PATH ? process.env.NODE_PATH : null,
				whitelist: [/^meetup-web-components/],
			}),
		],

		resolveLoader: {
			alias: {
				'require-loader': path.resolve(settings.utilsPath, 'require-loader.js'),
			},
		},

		resolve: {
			alias: {
				src: settings.appPath,
			},
			// module name extensions that Webpack will try if no extension provided
			extensions: ['.js', '.jsx', '.json'],
		},
	};
	if (buildConfig.isProd) {
		config.plugins = config.plugins.concat(settings.prodPlugins);
	}
	return config;
}

// export the config-building function for programmatic consumption
module.exports = getConfig;
