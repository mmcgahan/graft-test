// Require modules
const webpack = require('webpack');
const buildConfig = require('meetup-web-platform/lib/util/config/build')
	.default;
const StatsPlugin = require('stats-webpack-plugin');

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
			new webpack.EnvironmentPlugin({
				NODE_ENV: 'development', // required for prod build of React (specify default)
			}),
			new webpack.DefinePlugin({
				WEBPACK_BROWSER_BUILD_HASH: JSON.stringify(hash),
				WEBPACK_BROWSER_ASSET_PATHS: JSON.stringify(assetFilePaths),
			}),
			new StatsPlugin('stats.json', 'verbose'),
		],

		resolve: {
			// module name extensions
			extensions: ['.js', '.jsx'],
		},
	};

	if (buildConfig.isProd) {
		config.plugins = config.plugins.concat(settings.prodPlugins);
	}

	return config;
}

// export the config-building function for programmatic consumption
module.exports = getConfig;
