const forever = require('forever');
const settings = require('../webpack/settings.js');
const { getLocaleArgs } = require('../../util/nodeUtils.js');

const localeCodes = getLocaleArgs(settings.localeCodes);

forever.startDaemon('scripts/webpackDevServer.js', {
	max: 1,
	args: localeCodes,
	uid: 'asset-server',
	outFile: 'asset-server.log',
	errFile: 'asset-server.log',
	append: true,
});
