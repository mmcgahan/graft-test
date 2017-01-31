// Require modules
const path = require('path');
const webpack = require('webpack');

// Build settings
const settings = require('./settings.js');


/**
 * When in dev, we need to manually inject some configuration to enable HMR
 *
 * @param {Object} config webpack config object
 * @returns {Object} HMR-ified config
 */
function injectHotReloadConfig(config) {
	const ASSET_SERVER_PORT = process.env.ASSET_SERVER_PORT || 8001;
	const DEV_HOST = '0.0.0.0';

	config.entry.app.unshift(
		`webpack-dev-server/client?http://${DEV_HOST}:${ASSET_SERVER_PORT}/`,
		'webpack/hot/dev-server'
	);
	config.plugins.push(new webpack.HotModuleReplacementPlugin());
	return config;
}

// Webpack config
function getConfig(localeCode) {
	const config = {
		entry: {
			app: [settings.browserAppEntryPath]
		},

		output: {
			path: path.resolve(settings.browserAppOutputPath, localeCode),
			filename: '[name].[hash].js',
			// publicPath is set at **runtime** using __webpack_public_path__
			// in the browserApp entry script
		},

		devtool: settings.isDev ? 'eval' : 'source-map',

		module: {
			rules: [
				{
					test: /\.jsx?$/,
					loader: 'eslint-loader?{fix:true}',
					include: [settings.appPath],
					exclude: settings.assetPath,
					enforce: 'pre',
				},
				{
					test: /\.jsx?$/,
					include: [
						settings.appPath,
						settings.webComponentsSrcPath,
					],
					loader: 'babel-loader',
					options: settings.enableHMR ? {
						plugins: [['react-transform', {
							transforms: [{
								transform: 'react-transform-hmr',
								imports: ['react'],
								locals: ['module']
							}]
						}]]
					} : undefined
				},
				{
					test: /\.css$/,
					include: [settings.cssPath],
					loader: 'style-loader!css-loader'
				},
				{
					test: /\.json$/,
					include: [
						settings.appPath,
						settings.webComponentsSrcPath
					],
					loader: 'json-loader'
				},
				{
					test: /\.po$/,
					loader: 'json-loader!po-loader'
				}
			]
		},

		resolveLoader: {
			alias: {
				'require-loader': path.resolve(settings.utilsPath, 'require-loader.js')
			}
		},

		resolve: {
			alias: {
				trns: path.resolve(settings.trnsPath, `${localeCode}.po`)
			},

			// module name extensions
			extensions: ['.js', '.jsx', '.po'],
		},

		plugins: [
			new webpack.DefinePlugin({
				IS_DEV: settings.isDev,
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			}),
		]
	};

	if (settings.enableHMR) {
		injectHotReloadConfig(config);
	}
	if (!settings.isDev) {
		config.plugins = config.plugins.concat(settings.prodPlugins);
	}
	return config;
}

// export the config-building function _only_ - this cannot be run by the CLI
module.exports = getConfig;
