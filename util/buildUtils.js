const webpack = require('webpack');
const Rx = require('rxjs');

module.exports = {
	/**
	 * This function runs webpack against a supplied webpack config object,
	 * returning an Observable that emits the 'stats' about the bundle when it
	 * completes
	 *
	 * @link {https://webpack.github.io/docs/node.js-api.html#stats}
	 */
	compile$: function(config) {
		const compiler = webpack(config);
		const run = compiler.run.bind(compiler);  // bind context
		return Rx.Observable.bindNodeCallback(run)();  // convert to Observable
	}
};


