const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const Rx = require('rxjs');

const progressBarUI = require('../util/progressBarUI.js');
const { compile$ } = require('../util/buildUtils.js');
const { child_process$ } = require('../util/nodeUtils.js');
const writeBrowserAppBundle$ = require('./build-browser-app.js');
const getServerAppConfig = require('./webpack/serverAppConfig.js');
const getSWConfig = require('./webpack/swConfig.js');
const settings = require('./webpack/settings.js');

/**
 * This module builds the locale-specific bundles for the app, both browser and server
 *
 * The server locale bundles depend on the browser bundle filename, so they cannot be
 * built independently of the browser bundles
 *
 * Usage:
 * node scripts/build-server-app.js [<localeCode> [<localeCode>...]]
 * OR
 * node scripts/build-server-app.js --build <localeCode>
 *
 * @module build-server-app
 */

/**
 * consuming the full webpack compile stats from a browser bundle build, plus
 * the associated locale code, to build a corresponding server render bundle
 *
 * @link {https://webpack.github.io/docs/node.js-api.html#stats}
 * @param {String} localeCode the 'xx-XX' language/locale code for the build
 * @param {String} browserAppFilename the filename of the corresponding browser app bundle
 * @return {Observable} emits the successful build stats
 */
const writeServerAppBundle$ = localeCode => browserAppFilename => {
	// create the correct config
	const config = getServerAppConfig(localeCode, browserAppFilename);
	// compile it
	return compile$(config)
		.do(stats => {
			const filename = stats.toJson().assetsByChunkName['server-app'];
			const fullPath = path.resolve(settings.serverAppOutputPath, localeCode, filename);
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
 *
 * @param {String} localeCode the 'xx-XX' langauge/locale code for the build
 * @return {Observable} emits the stats of the successful server build
 */
const buildSingleServerApp$ = localeCode => writeBrowserAppBundle$(localeCode)
	.do(stats => console.log('building server locale'))
	.map(stats => stats.toJson({ hash: true }))
  .flatMap(stats =>
		writeServerAppBundle$(localeCode)(stats.assetsByChunkName.app)
			.merge(writeSWBundle$(localeCode)(stats.assets, stats.hash))
	); // Pass the browser bundle path to the corresponding server locale bundle config

function spawnBuild$(localeCode) {
	// call this script in a sub-process with an argument indicating the localeCode
	return child_process$('node', [path.resolve(__dirname, __filename), '--build', localeCode]);
}

/**
 * Export a function that takes an array of localeCodes and spawns a separate
 * child process to make the corresponding browser and server bundles
 *
 * This function runs the bundle builds _in parallel_ across multiple CPU cores
 */
const updateProgress = progressBarUI({
	total: 6,  // started, building/built browser bundler, building/built server bundle
	width: 20,
	blank: ' ',
});
const buildServerApp$ = localeCodes => Rx.Observable.from(localeCodes)
	.do(updateProgress('started'))
	.flatMap(localeCode =>
		spawnBuild$(localeCode)
			.do(status => updateProgress(status)(localeCode))
	);

module.exports = buildServerApp$;

if (!module.parent) {
	// looking for a CLI argument(s) indicating the localeCode(s) to build
	const argv = minimist(process.argv.slice(2));
	// the 'build' argument is a single locale code that will be built immediately
	if (argv.build) {
		// do the single-language build
		buildSingleServerApp$(argv.build).subscribe();
	} else {
		// this script can also be passed an array of localeCodes to build in parallel
		const { getLocaleArgs } = require('../util/nodeUtils.js');

		const localeCodes = getLocaleArgs(settings.localeCodes);

		// When the server apps are built, we will write a file that exports all of the
		// newly-built bundles.
		// The first step is building an array of localeCode-bundlePath pairs
		// in the form ['<localeCode>: require(<bundlePath>).default', ...]
		const codeBundlePairStrings = localeCodes.reduce((acc, localeCode) => {
			const serverAppPath = path.resolve(settings.serverAppOutputPath, localeCode, 'server-app');
			const requireString = `require('${serverAppPath}').default`;
			acc.push(`'${localeCode}': ${requireString}`);
			return acc;
		}, []);
		// now inject the pairs into a stringified Object
		// **note** This doesn't use JSON.stringify because we don't want the
		// `require` statements to either be _evaluated_ or treated as a string
		const serverAppMapString = `{${codeBundlePairStrings.join(',')}}`;

		const build$ = localeCodes.length > 1 ?
			buildServerApp$(localeCodes) :
			buildSingleServerApp$(localeCodes[0]);

		build$
			.subscribe(
				null,
				null,
				() =>
					fs.writeFileSync(
						settings.serverAppModulePath,
						`module.exports = ${serverAppMapString};`
					)
			);
	}
}

