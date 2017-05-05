const fork = require('child_process').fork;
const path = require('path');

const chalk = require('chalk');
const webpack = require('webpack');
const getServerAppConfig = require('./webpack/serverAppConfig');
const appServerConfig = require('./webpack/appServerConfig.js');

/*
 * The complete application requires 3 bundles:
 * 1. Browser application
 * 2. Server application (mostly the same as 1)
 * 3. Node app server
 *
 * Each of these bundles has its own configuration, and both (1) and (2) can be
 * split into multiple independent languages bundles that resolve TRN
 * dependencies independently.
 *
 * In dev, each bundle is compiled by Webpack in 'watch mode', meaning that the
 * `entry` script and its dependencies will be watched for changes, and the
 * bundle will be rebuilt immediately.
 *
 * In addition to bundling, the bundles must be _served_.
 *
 * The Browser application (1) is compiled, watched, and served by the Webpack
 * Dev Server. The Server application and Node app server are bundled by
 * separate compilers, and then served by a process that can be restarted when
 * a new bundle is created.
 *
 * This script manages all aspects of the dev server:
 * 1. Start the Webpack Dev Server for the Browser application bundle (1) - CHILD PROCESS
 * 2. Start the Webpack watch-mode compiler for the Server application (2)
 * 3. Start the Webpack watch-mode compiler for the Node app server (3)
 * 4. Start the Node app server when (2) is built - CHILD PROCESS
 * 5. Start the Node app server when (3) is built - CHILD PROCESS
 * 6. _Re_-start the Node app server when (2) is _re_-built
 * 7. _Re_-start the Node app server when (3) is _re_-built
 *
 * Assumptions:
 * 1. You only want to build a single language (This could probably be enabled)
 * 2. The bundle filenames are not hashed (This might be allowable if we work our ManifestPlugin)
 *
 * Relevant Webpack docs:
 * - https://webpack.js.org/api/plugins/compiler/#watching
 * - https://webpack.js.org/configuration/watch/#watchoptions
 * - https://webpack.js.org/api/node/#watching
 */
const ready = {
	serverApp: false,
	appServer: false,
};
let appServerProcess;

/*
 * 1. Start the Webpack Dev Server for the Browser application bundle (1)
 */
fork(path.resolve(__dirname, 'webpackDevServer'));

const newServerProcess = () => {
	if (ready.serverApp) {
		appServerProcess = fork(path.resolve(__dirname, './_start-dev-server'), [
			'--en-US=../build/server-app/en-US/server-app',
		]);
		ready.appServer = true;
	}
};
const startServer = () => {
	if (appServerProcess) {
		appServerProcess.kill();
		ready.appServer = false;
	}
	newServerProcess();
};

const getCompileLogger = type => (err, stats) => {
	console.log(chalk.blue(`${type} compile finished\n`));
};

/*
 * 2. Start the Webpack watch-mode compiler for the Server application (2)
 */
const serverAppCompileLogger = getCompileLogger('server app');
const serverAppCompiler = webpack(getServerAppConfig('en-US', 'app.js'));
serverAppCompiler.watch(
	{}, // watch options
	(err, stats) => {
		serverAppCompileLogger(err, stats);
		if (err) {
			throw err;
		}
		ready.serverApp = true;
		// 4/6. (Re)start the Node app server when (2) is (re)-built
		startServer();
	}
);

/*
 * 3. Start the Webpack watch-mode compiler for the Node app server (3)
 */
const appServerCompileLogger = getCompileLogger('app server');
const appServerCompiler = webpack(appServerConfig);
appServerCompiler.watch(
	{ aggregateTimeout: 300 }, // watch options
	(err, stats) => {
		appServerCompileLogger(err, stats);
		if (err) {
			throw err;
		}
		const info = stats.toJson();

		if (stats.hasErrors()) {
			info.errors.forEach(err => console.error(chalk.red(err)));
		}

		if (stats.hasWarnings()) {
			info.warnings.forEach(err => console.warn(chalk.yellow(err)));
		}
		// 5/7. (Re)start the Node app server when (3) is (re)-built
		startServer();
	}
);
