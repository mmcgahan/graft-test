const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const Rx = require('rxjs');

const progressBarUI = require('../utils/progressBarUI.js');
const { compile$ } = require('../utils/buildUtils.js');
const { child_process$ } = require('../utils/nodeUtils.js');
const writeClientLocaleBundle$ = require('./build-client.js');
const getServerLocaleConfig = require('./webpack/serverLocaleConfig.js');
const getSWConfig = require('./webpack/swConfig.js');
const settings = require('./webpack/settings.js');

/**
 * This module builds the locale-specific bundles for the app, both client and server
 *
 * The server locale bundles depend on the client bundle filename, so they cannot be
 * built independently of the client bundles
 *
 * Usage:
 * node scripts/build-locales.js [<localeCode> [<localeCode>...]]
 * OR
 * node scripts/build-locales.js --build <localeCode>
 *
 * @module build-locales
 */

/**
 * consuming the full webpack compile stats from a client bundle build, plus
 * the associated locale code, to build a corresponding server render bundle
 *
 * @link {https://webpack.github.io/docs/node.js-api.html#stats}
 */
const writeServerLocaleBundle$ = localeCode => clientFilename => {
	// create the correct config
	const config = getServerLocaleConfig(localeCode, clientFilename);
	// compile it
	return compile$(config)
		.do(stats => {
			const filename = stats.toJson().assetsByChunkName['server-locale'];
			const fullPath = path.resolve(settings.serverLocaleOutputPath, localeCode, filename);
			const relativeBundlePath = path.relative(settings.outPath, fullPath);
			console.log(`built ${relativeBundlePath}`);
		});
};

const writeSWBundle$ = localeCode => (assets, hash) => {
	const config = getSWConfig(localeCode, assets, hash);
	// compile it
	return compile$(config)
		.do(stats => {
			const filename = stats.toJson().assetsByChunkName['sw'];
			const fullPath = path.resolve(settings.serviceWorkerOutputPath, filename);
			const relativeBundlePath = path.relative(settings.outPath, fullPath);
			console.log(`built ${relativeBundlePath}`);
		});
};

/**
 * Build a single locale bundle
 */
const buildLocale$ = localeCode => writeClientLocaleBundle$(localeCode)
	.do(stats => console.log('building server locale'))
	.map(stats => stats.toJson({ hash: true }))
  .flatMap(stats =>
		writeServerLocaleBundle$(localeCode)(stats.assetsByChunkName.client)
			.merge(writeSWBundle$(localeCode)(stats.assets, stats.hash))
	); // Pass the client path to the corresponding server locale bundle config

function spawnBuild$(localeCode) {
	// call this script in a sub-process with an argument indicating the localeCode
	return child_process$('node', [path.resolve(__dirname, __filename), '--build', localeCode]);
}

/**
 * Export a function that takes an array of localeCodes and spawns a separate
 * child process to make the corresponding client and server-locale bundles
 *
 * This function runs the bundle builds _in parallel_ across multiple CPU cores
 */
const updateProgress = progressBarUI({
	total: 6,  // started, building/built client, building/built server locale
	width: 20,
	blank: ' ',
});
const buildLocales$ = localeCodes => Rx.Observable.from(localeCodes)
	.do(updateProgress('started'))
	.flatMap(localeCode =>
		spawnBuild$(localeCode)
			.do(status => updateProgress(status)(localeCode))
	);

module.exports = buildLocales$;

if (!module.parent) {
	// looking for a CLI argument(s) indicating the localeCode(s) to build
	const argv = minimist(process.argv.slice(2));
	// the 'build' argument is a single locale code that will be built immediately
	if (argv.build) {
		// do the single-language build
		buildLocale$(argv.build).subscribe();
	} else {
		// this script can also be passed an array of locales to build in parallel
		const { getLocaleArgs } = require('../utils/nodeUtils.js');

		const localeCodes = getLocaleArgs(settings.localeCodes);

		// When the locales are built, we will write a file that exports all of the
		// newly-built bundles.
		// The first step is building an array of localeCode-bundlePath pairs
		// in the form ['<localeCode>: require(<bundlePath>).default', ...]
		const codeBundlePairStrings = localeCodes.reduce((acc, localeCode) => {
			const serverLocalePath = path.resolve(settings.serverLocaleOutputPath, localeCode, 'server-locale');
			const requireString = `require('${serverLocalePath}').default`;
			acc.push(`'${localeCode}': ${requireString}`);
			return acc;
		}, []);
		// now inject the pairs into a stringified Object
		// **note** This doesn't use JSON.stringify because we don't want the
		// `require` statements to either be _evaluated_ or treated as a string
		const serverLocaleMapString = `{${codeBundlePairStrings.join(',')}}`;

		const build$ = localeCodes.length > 1 ?
			buildLocales$(localeCodes) :
			buildLocale$(localeCodes[0]);

		build$
			.subscribe(
				null,
				null,
				() =>
					fs.writeFileSync(
						settings.serverLocalesModulePath,
						`module.exports = ${serverLocaleMapString};`
					)
			);
	}
}

