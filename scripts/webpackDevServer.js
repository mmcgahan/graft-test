const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const settings = require('./webpack/settings.js');
const getBrowserAppConfig = require('./webpack/browserAppConfig.js');
const { getLocaleArgs } = require('../util/nodeUtils.js');

const ASSET_SERVER_PORT = process.env.ASSET_SERVER_PORT || 8001;
const DEV_HOST = '0.0.0.0';

const localeCodes = getLocaleArgs(settings.localeCodes);
const configs = localeCodes.map(getBrowserAppConfig);
const compiler = webpack(configs);
const options = {
	hot: true,
	publicPath : `http://${DEV_HOST}:${ASSET_SERVER_PORT}/static/`,
	disableHostCheck: true,  // can be accessed by any network request
	headers: {
		'Access-Control-Allow-Origin': '*',  // will respond to any host
	},
};
if (configs.length === 1) {
	// WDS won't respect config's publicPath when only 1 config is set
	// so we need to force it in the `options`
	options.publicPath = `/static/${localeCodes[0]}/`;
}

const server = new WebpackDevServer(
	compiler,
	options
);

server.listen(
	ASSET_SERVER_PORT,
	DEV_HOST
);

