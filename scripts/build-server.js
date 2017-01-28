const path = require('path');
const { compile$ } = require('../util/buildUtils.js');
const appServerConfig = require('./webpack/appServerConfig.js');
const settings = require('./webpack/settings.js');

/**
 * @module build-server
 */

/**
 * Write the server bundle - no need to read anything from previous build,
 * but it _is_ necessary that the server render bundles are _all_ complete
 *
 * Just compile and log, no fuss
 *
 * @return {Observable} emits the stats of the successful build
 */
function writeServerBundle$() {
	return compile$(appServerConfig)
		.do(stats => {
			const filename = stats.toJson().assetsByChunkName['app-server'];
			const fullPath = `${appServerConfig.output.path}/${filename}`;
			const relativeBundlePath = path.relative(settings.outPath, fullPath);
			console.log(`Built ${relativeBundlePath}`);
		});
}

module.exports = writeServerBundle$;

if (!module.parent) {
	// If the module has no parent, it is being run directly by node, which
	// means we should do the whole build
	console.log('Building app server');
	writeServerBundle$()
		.subscribe(
			stats => console.log('Done writing server bundle')
		);

}

