// Require modules
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

// Build settings
const settings = require('./settings.js');

// Webpack config
module.exports = {
	entry: {
		'app-server': [settings.serverEntryPath]
	},

	output: {
		libraryTarget: 'commonjs2',
		path: settings.serverOutputPath,
		filename: '[name].js',
		// publicPath is set at **runtime** using __webpack_public_path__
		// in the app-server entry script
	},

	// using eval until this is fixed - https://bugs.chromium.org/p/chromium/issues/detail?id=658438
	// devtool: settings.isDev ? 'eval' : 'eval',
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
				loader: 'style-loader!css-loader',
				include: [settings.cssPath]
			},
		]
	},

	target: 'node',

	plugins: [
		new webpack.DefinePlugin({
			IS_DEV: settings.isDev,
		}),
	],

	externals: [
		nodeExternals({
			modulesDir : process.env.NODE_PATH ? process.env.NODE_PATH : null,
			whitelist: [/^meetup-web-components/],
		}),
		/.*?build\//
	],

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
