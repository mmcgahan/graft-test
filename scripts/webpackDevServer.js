const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const settings = require('./webpack/settings.js');
const getClientConfig = require('./webpack/clientConfig.js');
const { getLocaleArgs } = require('../utils/nodeUtils.js');

const ASSET_SERVER_PORT = process.env.ASSET_SERVER_PORT || 8001;
const DEV_HOST = '0.0.0.0';

const localeCodes = getLocaleArgs(settings.localeCodes);
const configs = localeCodes.map(getClientConfig);
const compiler = webpack(configs);
const options = {
	hot: true,
};
if (configs.length === 1) {
	// WDS won't respect config's publicPath when only 1 config is set
	// so we need to force it in the `options`
	options.publicPath = `/${localeCodes[0]}/`;
}

const server = new WebpackDevServer(
	compiler,
	options
);

server.listen(
	ASSET_SERVER_PORT,
	DEV_HOST
);

