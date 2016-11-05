import fs from 'fs';
import Inert from 'inert';
import { startServer } from 'meetup-web-platform';
import settings from './webpack/settings.js';
import serverAppMap from '../build/server-app/serverAppMap';

/**
 * Route for service worker script at top-level path
 *
 * It consumes the assetPublicPath as an argument because that is only
 * determined at runtime, not at compile time for the service worker.
 *
 * The 'bundled' service worker is then used as a template string to render the
 * script response, replacing the `ASSET_PUBLIC_PAth` with the
 * `assetPublicPath` string
 *
 * @param {String} assetPublicPath
 * @param {String} swTemplatePath optional path to the bundled service worker
 * @return {Object} the Hapi route object
 */
function getServiceWorkerRoute(
	assetPublicPath,
	swTemplatePath=`${settings.serviceWorkerOutputPath.substr(1)}/sw.js`  // build/sw/sw.js
) {
	const swTemplate = fs.readFileSync(swTemplatePath).toString();
	const swScript = swTemplate.replace(
		/ASSET_PUBLIC_PATH/g,
		`'${assetPublicPath}'`
	);
	return {
		method: 'GET',
		path: '/sw.js',  // must match browser app `serviceWorker.register` call
		handler: (request, reply) => reply(swScript).type('application/javascript')
	};
}

/**
 * special route for root request for favicon - the file path is written by
 * webpack, which will handle versioning and bundling for production
 *
 * the file handler needs to use output.path instead of output.publicPath,
 * so we have to do some string substitution here
 */
function getFaviconRoute(serverOutputPath=settings.serverOutputPath) {
	const faviconFilename = require('file-loader?name=[hash].[ext]!../src/assets/favicon.ico');
	const faviconPath = `${serverOutputPath.substr(1)}/${faviconFilename}`;

	return {
		method: 'GET',
		path: '/favicon.ico',
		handler: {
			file: faviconPath
		}
	};
}


function getRoutes() {
	// read runtime values
	const assetHost = process.env.ASSET_SERVER_HOST || '0.0.0.0';
	const assetPort = process.env.ASSET_SERVER_PORT ?
		`:${process.env.ASSET_SERVER_PORT}` :
		'';
	const assetPublicPath = `//${assetHost}${assetPort}`;

	return [
		getFaviconRoute(),
		getServiceWorkerRoute(assetPublicPath),
	];
}

/**
 * The actual configure-and-start function
 */
function main() {
	const plugins = [Inert];  // for serving the favicon
	const routes = getRoutes();

	startServer(serverAppMap, { routes, plugins })
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

