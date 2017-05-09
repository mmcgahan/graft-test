const fork = require('child_process').fork;
const path = require('path');

const chalk = require('chalk');
const webpack = require('webpack');
const getServerAppConfig = require('./webpack/serverAppConfig');
const appServerConfig = require('./webpack/appServerConfig.js');
const settings = require('./webpack/settings');

const serverAppLang = settings.localeCodes[0]; // top of the preferred lang list
const serverAppPath = `../build/server-app/${serverAppLang}/server-app`;
const ready = {
	serverApp: false,
	appServer: false,
};
let appServerProcess;

/*
 * 1. Start the Webpack Dev Server for the Browser application bundle
 */
fork(path.resolve(__dirname, 'webpackDevServer'), [serverAppLang]);

/*
 * Start a new server child process
 *
 * This function assumes that the server app corresponding to
 * serverAppLang will be available at serverAppPath when
 * `reader.serverApp` is true
 */
const startServer = () => {
	if (appServerProcess) {
		appServerProcess.kill();
		ready.appServer = false;
	}
	// Ignore the call if the serverApp is not ready
	if (!ready.serverApp) {
		return;
	}
	appServerProcess = fork(path.resolve(__dirname, './_start-dev-server'), [
		`--${serverAppLang}=${serverAppPath}`,
	]);
	ready.appServer = true;
};

const getCompileLogger = type => (err, stats) => {
	console.log(chalk.blue(`${type} compile finished\n`));
};

/*
 * 2. Start the Webpack watch-mode compiler for the Server application
 *
 * no need to check for errors/warnings in the stats because this build
 * parallels the one done in the Webpack Dev Server, and WDS will print
 * error messages whenever there is something wrong.
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
		// 4. (Re)start the Node app server when Server application is (re)-built
		startServer();
	}
);

/*
 * 3. Start the Webpack watch-mode compiler for the Node app server
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
		// 5. (Re)start the Node app server when the Node app server is (re)-built
		startServer();
	}
);
