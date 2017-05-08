const minimist = require('minimist');
const runServer = require('../build/app-server').default;

/*
 * This script should generally _NOT_ be run directly - it is intended to run
 * as a child process of scripts/start-dev.js
 *
 * Start a dev server using server app bundles specified by command line args,
 * e.g.
 *
 * ```
 * $ node scripts/_start-dev-server.js --en-US=../build/server-app/en-US/server-app.js
 * ```
 */
function startDevServer() {
	const argv = minimist(process.argv.slice(2));
	const serverAppMap = Object.keys(argv)
		.filter(a => a !== '_') // this is minimist's arg catch-all key - not needed
		.reduce((map, localeCode) => {
			const importPath = argv[localeCode];
			map[localeCode] = require(importPath).default;
			return map;
		}, {});
	runServer(serverAppMap);
}

startDevServer();

module.exports = startDevServer;
