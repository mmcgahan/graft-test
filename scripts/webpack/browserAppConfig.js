// Require modules
const path = require('path');
const webpack = require('webpack');
const StatsPlugin = require('stats-webpack-plugin');

// Build settings
const settings = require('./settings.js');

// Env config
const buildConfig = require('meetup-web-platform/lib/util/config/build')
	.default;

/**
 * When in dev, we need to manually inject some configuration to enable HMR
 *
 * @param {Object} config webpack config object
 * @returns {Object} HMR-ified config
 */
function injectHotReloadConfig(config) {
	config.entry.app.unshift(
		'react-hot-loader/patch', // logic for hot-reloading react components
		`webpack-dev-server/client?http://${buildConfig.asset_server.host}:${buildConfig.asset_server.port}/`, // connect to HMR websocket
		'webpack/hot/dev-server' // run the dev server
	);

	// plugins
	config.plugins.push(new webpack.HotModuleReplacementPlugin()); // enable module.hot
	config.plugins.push(new webpack.NamedModulesPlugin()); // show HMR module filenames

	// inject code hooks into react-hot-loader/patch
	const jsRule = config.module.rules.find(rule =>
		(rule.use || []).find(use => use.loader === 'babel-loader')
	);
	jsRule.use.unshift('react-hot-loader/webpack');

	return config;
}

// Webpack config
function getConfig(localeCode) {
	const config = {
		entry: {
			app: [settings.browserAppEntryPath],
		},

		output: {
			path: path.resolve(settings.browserAppOutputPath, localeCode),
			filename: buildConfig.isDev
				? '[name].js' // in dev, keep the filename consistent to make reloading easier
				: '[name].[hash].js', // in prod, add hash to enable long-term caching
			// publicPath is set at **runtime** using __webpack_public_path__
			// in the browserApp entry script
		},

		devtool: buildConfig.isDev ? 'eval' : 'source-map',

		module: {
			rules: [
				{
					test: /\.jsx?$/,
					loader: 'eslint-loader',
					include: [settings.appPath],
					exclude: settings.assetPath,
					enforce: 'pre',
					options: {
						cache: true,
					},
				},
				{
					test: /\.jsx?$/,
					include: [settings.appPath, settings.webComponentsSrcPath],
					use: [
						{
							loader: 'babel-loader',
							options: {
								cacheDirectory: true,
							},
						},
					],
				},
				{
					test: /\.css$/,
					include: [settings.cssPath],
					use: ['style-loader', 'css-loader'],
				},
			],
		},

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

		plugins: [
			new webpack.EnvironmentPlugin({
				NODE_ENV: 'development', // required for prod build of React (specify default)
			}),
			new StatsPlugin('stats.json', 'verbose'),
		],
	};

	if (settings.enableHMR) {
		injectHotReloadConfig(config);
	}
	if (buildConfig.isProd) {
		config.plugins = config.plugins.concat(settings.prodPlugins);
	}
	return config;
}

// export the config-building function _only_ - this cannot be run by the CLI
module.exports = getConfig;
