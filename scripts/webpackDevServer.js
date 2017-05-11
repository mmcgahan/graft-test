const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const buildConfig = require('meetup-web-platform/lib/util/config/build')
	.default;
const settings = require('./webpack/settings.js');
const getBrowserAppConfig = require('./webpack/browserAppConfig.js');
const { getLocaleArgs } = require('../util/nodeUtils.js');

const localeCodes = getLocaleArgs(settings.localeCodes);
const configs = localeCodes.map(getBrowserAppConfig);
const compiler = webpack(configs);
const options = {
	hot: true,
	publicPath: `http://${buildConfig.asset_server.host}:${buildConfig.asset_server.port}${buildConfig.asset_server.path}/`,
	disableHostCheck: true, // can be accessed by any network request
	headers: {
		'Access-Control-Allow-Origin': '*', // will respond to any host
	},
};

if (configs.length === 1) {
	// WDS won't respect config's publicPath when only 1 config is set
	// so we need to force it in the `options`
	options.publicPath = `${buildConfig.asset_server.path}/${localeCodes[0]}/`;
}

const server = new WebpackDevServer(compiler, options);

server.listen(buildConfig.asset_server.port, '0.0.0.0'); // always start dev server on open IP
