// Require modules
const path = require('path');
const webpack = require('webpack');

// Build settings
const settings = require('./settings.js');


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
			// in the browser app entry script
		},

		devtool: settings.isDev ? 'eval' : 'source-map',

		module: {
			preLoaders: [
				{
					test: /\.jsx?$/,
					loader: 'eslint-loader?{fix:true}',
					include: [settings.appPath],
					exclude: settings.assetPath
				}
			],

			loaders: [
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
					loader: 'style!css'
				},
				{
					test: /\.json$/,
					include: [
						settings.appPath,
						settings.webComponentsSrcPath
					],
					loader: 'json'
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
				trns: path.resolve(settings.trnsPath, localeCode)
			},

			// module name extensions
			extensions: ['.js', '.jsx'],
		},

		plugins: [
			new webpack.DefinePlugin({
				IS_DEV: settings.isDev,
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			}),
		]
	};

	if (!settings.isDev) {
		config.plugins = config.plugins.concat(settings.prodPlugins);
	}
	return config;
}

// export the config-building function _only_ - this cannot be run by the CLI
module.exports = getConfig;
