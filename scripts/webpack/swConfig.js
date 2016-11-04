// Require modules
const webpack = require('webpack');

// Build settings
const settings = require('./settings.js');

// Webpack config
function getConfig(localeCode, assets, hash) {
	const publicPath = `/${localeCode}/`;
	const assetFilePaths = assets.map(({ name }) =>
		`${publicPath}${name}`
	);

	const config = {
		entry: {
			sw: [settings.serviceWorkerEntryPath]
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
					include: [
						settings.appPath,
					],
					loader: 'babel-loader',
				},
			]
		},

		plugins: [
			new webpack.DefinePlugin({
				WEBPACK_CLIENT_BUILD_HASH: JSON.stringify(hash),
				WEBPACK_CLIENT_ASSET_PATHS: JSON.stringify(assetFilePaths),
				IS_DEV: settings.isDev,
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			}),
		],

		resolve: {
			// module name extensions
			extensions: ['.js', '.jsx']
		}
	};
	if (!settings.isDev) {
		config.plugins = config.plugins.concat(settings.prodPlugins);
	}
	return config;
}

// export the config-building function for programmatic consumption
module.exports = getConfig;

