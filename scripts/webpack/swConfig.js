// Require modules
const webpack = require('webpack');
const envConfig = require('../../src/util/config');

// Build settings
const settings = require('./settings.js');

// Webpack config
function getConfig(localeCode, assets, hash) {
	const publicPath = `/${localeCode}/`;
	const assetFilePaths = assets.map(({ name }) => `${publicPath}${name}`);

	const config = {
		entry: {
			sw: [settings.serviceWorkerEntryPath],
		},

		output: {
			path: settings.serviceWorkerOutputPath,
			filename: '[name].js',
			publicPath,
		},

		devtool: 'eval',

		module: {
			loaders: [
				{
					test: /\.jsx?$/,
					include: [settings.appPath],
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
					},
				},
			],
		},

		plugins: [
			new webpack.DefinePlugin({
				WEBPACK_BROWSER_BUILD_HASH: JSON.stringify(hash),
				WEBPACK_BROWSER_ASSET_PATHS: JSON.stringify(assetFilePaths),
				IS_DEV: envConfig.isDev,
				'process.env.NODE_ENV': JSON.stringify(envConfig.env),
			}),
		],

		resolve: {
			// module name extensions
			extensions: ['.js', '.jsx'],
		},
	};

	if (envConfig.isProd) {
		config.plugins = config.plugins.concat(settings.prodPlugins);
	}

	return config;
}

// export the config-building function for programmatic consumption
module.exports = getConfig;
