// Require modules
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
		path: settings.outPath,
		filename: '[name].js',
		// publicPath is set at **runtime** using __webpack_public_path__
		// in the app-server entry script
	},

	devtool: settings.isProduction ? 'source-map' : 'eval',

	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				// need to load meetup-web-platform until it is a standalone module
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

	target: 'node',

	externals: [
		nodeExternals({
			modulesDir : process.env.NODE_PATH ? process.env.NODE_PATH : null,
			whitelist: [/^meetup-web-platform/],
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
