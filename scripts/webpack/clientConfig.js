// Require modules
const path = require('path');
const webpack = require('webpack');

// Build settings
const settings = require('./settings.js');

function injectProdPlugins(config) {
	const prodPlugins = [
		// Removes duplicate module code (rare, but can happen)
		new webpack.optimize.DedupePlugin(),

		// Tells loaders to optimize what they can since in minimize mode
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			debug: false,
			quiet: true
		}),

		// Removes dead code in conjuction with UglifyJS
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"',
			},
		}),

		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			},
			output: {
				comments: false
			}
		}),
	];
	config.plugins = config.plugins.concat(prodPlugins);
	return config;
}

/**
 * When in dev, we need to manually inject some configuration to enable HMR
 *
 * @param {Object} config webpack config object
 * @returns {Object} HMR-ified config
 */
function injectHotReloadConfig(config) {
	const ASSET_SERVER_PORT = process.env.ASSET_SERVER_PORT || 8001;
	const DEV_HOST = '0.0.0.0';

	config.entry.client.unshift(
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
			client: [settings.clientEntryPath]
		},

		output: {
			path: path.resolve(settings.clientOutputPath, localeCode),
			filename: '[name].[hash].js',
			// publicPath is set at **runtime** using __webpack_public_path__
			// in the client entry script
		},

		devtool: settings.isProduction ? 'source-map' : 'eval',

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
						settings.platformPath,
					],
					loader: 'babel-loader',
					query: settings.isProduction ? {} : {
						plugins: [['react-transform', {
							transforms: [{
								transform: 'react-transform-hmr',
								imports: ['react'],
								locals: ['module']
							}]
						}]]
					}
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

		resolveLoader: {
			alias: {
				'require-loader': path.resolve(settings.utilsPath, 'require-loader.js')
			}
		},

		resolve: {
			// module name extensions
			extensions: ['.js', '.jsx'],
		},

		plugins: []
	};

	if (settings.isProduction) {
		injectProdPlugins(config);
	} else {
		injectHotReloadConfig(config);
	}
	return config;
}

// export the config-building function _only_ - this cannot be run by the CLI
module.exports = getConfig;
