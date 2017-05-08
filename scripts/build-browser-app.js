const path = require('path');
const Rx = require('rxjs');

const { compile$ } = require('../util/buildUtils.js');
const settings = require('./webpack/settings.js');
const getBrowserAppConfig = require('./webpack/browserAppConfig.js');

/**
 * Observable that takes _all_ the localeCodes in webpack settings and writes
 * the bundles to disk
 *
 * This is the module export so that it can be composed with other bundles that
 * might be dependent on its output, e.g. the server app bundles that need
 * to reference the hashed browserApp bundle filenames in the server build script
 *
 * This script is currently never executed directly
 *
 * @module writeBrowserAppBundle$
 * @param {String} localeCode the 'xx-XX' langeuage/locale code for the browserApp build
 * @return {Observable} emits the (successful) build stats
 */
const writeBrowserAppBundle$ = localeCode =>
	Rx.Observable
		.of(localeCode)
		.do(localeCode => console.log('building browser app'))
		.map(getBrowserAppConfig) // map the localeCodes onto locale-specific webpack configs
		.flatMap(compile$) // run webpack with each locale-specific config - see `getBrowserAppConfig` for details
		.do(stats => {
			const filename = stats.toJson().assetsByChunkName.app; // filename determined by webpack output.filename
			const fullPath = path.resolve(
				settings.browserAppOutputPath,
				localeCode,
				filename
			); // reference the full build path
			const relativeBundlePath = path.relative(settings.outPath, fullPath); // just the path relative to the build dir
			console.log(`built ${relativeBundlePath}`);
		});

module.exports = writeBrowserAppBundle$;
