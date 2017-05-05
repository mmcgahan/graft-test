const minimist = require('minimist');
const runServer = require('../build/app-server').default;

/*
 * Start a dev server using server app bundles specified by command line args
 */
function startDevServer() {
	const argv = minimist(process.argv.slice(2));
	const serverAppMap = Object.keys(argv)
		.filter(a => a !== '_')
		.reduce((map, localeCode) => {
			const importPath = argv[localeCode];
			map[localeCode] = require(importPath).default;
			return map;
		}, {});
	runServer(serverAppMap);
}

startDevServer();

module.exports = startDevServer;
