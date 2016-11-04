const path = require('path');
const Rx = require('rxjs');

const { compile$ } = require('../util/buildUtils.js');
const settings = require('./webpack/settings.js');
const getClientConfig = require('./webpack/clientConfig.js');

/**
 * Observable that takes _all_ the localeCodes in webpack settings and writes
 * the bundles to disk
 *
 * This is the module export so that it can be composed with other bundles that
 * might be dependent on its output, e.g. the server locales bundles that need
 * to reference the hashed client bundle filenames in the server build script
 *
 * This script is currently never executed directly
 *
 * @module writeClientLocaleBundle$
 */
const writeClientLocaleBundle$ = localeCode =>
	Rx.Observable.of(localeCode)
		.do(localeCode => console.log('building client'))
		.map(getClientConfig)  // map the localeCodes onto locale-specific webpack configs
		.flatMap(compile$)     // run webpack with each locale-specific config - see `getClientConfig` for details
		.do(stats => {
			const filename = stats.toJson().assetsByChunkName.client;  // filename determined by webpack output.filename
			const fullPath = path.resolve(settings.clientOutputPath, localeCode, filename);  // reference the full build path
			const relativeBundlePath = path.relative(settings.outPath, fullPath);  // just the path relative to the build dir
			console.log(`built ${relativeBundlePath}`);
		});

module.exports = writeClientLocaleBundle$;

if (!module.parent) {
	writeClientLocaleBundle$('en-US').subscribe();
}

