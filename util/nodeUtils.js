const child_process = require('child_process');
const minimist = require('minimist');
const Rx = require('rxjs');

/**
 * General utilities to help with Node scripts
 * @module nodeUtils
 */

/**
 * Need to run a child process and stream its stdout output in an observable?
 * This is the Observable-creating function for you.
 * @param {String} cmd the command-line command to run
 * @param {Array} args an array of arguments to pass to the command
 * @return {Observable} emits the 'data' event data (stdout output)
 */
const child_process$ = (cmd, args) => {
	const child = child_process.spawn(cmd, args);
	return Rx.Observable.create(obs => {
		child.stdout.on('data', data => {
			obs.next(data.toString());
		});
		child.on('close', code => {
			if (code !== 0) {
				obs.error(new Error(`child process "${arguments}" exited with code ${code}`));
			}
			obs.complete();
		});
	});
};

/**
 * Check for any CLI arguments corresponding to valid localeCodes,
 * and return those. If no valid localeCodes passed in, return
 * all possible localeCodes
 *
 * @param {Array} validLocaleCodes an array of allowed 'xx-XX' locale codes
 * @return {Array} the locale codes specified by command line arguments to this script
 */
const getLocaleArgs = validLocaleCodes => {
	const argv = minimist(process.argv.slice(2));

	// this script can also be passed an array of locales to build
	const argLocaleCodes = argv._.filter(
		argCode => validLocaleCodes.some(lc => lc === argCode)
	);
	return argLocaleCodes.length ? argLocaleCodes : validLocaleCodes;
};


module.exports = {
	child_process$,
	getLocaleArgs
};

