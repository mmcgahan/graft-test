import Inert from 'inert';
import startServer from 'meetup-web-platform/server';
import WebpackConfig from './webpack/appServerConfig.js';
import serverLocaleMap from '../build/server-locales/serverLocaleMap';

function getRoutes() {
	/**
	 * special route for root request for favicon - the file path is written by
	 * webpack, which will handle versioning and bundling for production
	 *
	 * the file handler needs to use output.path instead of output.publicPath,
	 * so we have to do some string substitution here
	 */
	const faviconFilename = require('file-loader?name=[hash].[ext]!../src/assets/favicon.ico');
	const faviconPath = `${WebpackConfig.output.path}/${faviconFilename}`;

	const faviconRoute = {
		method: 'GET',
		path: '/favicon.ico',
		handler: {
			file: faviconPath
		}
	};

	return [faviconRoute];
}

/**
 * The actual configure-and-start function
 */
function main() {
	const plugins = [Inert];  // for serving the favicon
	const routes = getRoutes();

	startServer(serverLocaleMap, { routes, plugins })
		.catch(err => {  // catch because otherwise Node swallows errors in Promises
			console.log(err.stack);
			process.exit();
		});
}

if (!module.parent) {
	// If the module has no parent, it is being run directly by node - go ahead
	// and start it up
	main();
}

