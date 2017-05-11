import fs from 'fs';
import Inert from 'inert';
import appConfig from 'meetup-web-platform/lib/util/config';

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
 * @param {String} assetPublicPath the full URL to the static asset server
 * @param {String} swTemplatePath optional path to the bundled service worker
 * @return {Object} the Hapi route object
 */
function getServiceWorkerRoute(
	assetPublicPath,
	swTemplatePath = `${settings.serviceWorkerOutputPath.substr(1)}/sw.js`
) {
	const swTemplate = fs.readFileSync(swTemplatePath).toString();
	const swScript = swTemplate.replace(
		/ASSET_PUBLIC_PATH/g,
		`'${assetPublicPath}'`
	);
	return {
		method: 'GET',
		path: '/sw.js', // must match client `serviceWorker.register` call
		config: {
			auth: false,
		},
		handler: (request, reply) => reply(swScript).type('application/javascript'),
	};
}

/**
 * special route for root request for favicon - the file path is written by
 * webpack, which will handle versioning and bundling for production
 *
 * the file handler needs to use output.path instead of output.publicPath,
 * so we have to do some string substitution here
 *
 * @param {String} serverOutputPath the file path to the server build
 * @return {Object} the route for the favicon
 */
function getFaviconRoute(serverOutputPath = settings.serverOutputPath) {
	const faviconFilename = require('file-loader?name=[hash].[ext]!../src/assets/favicon.ico');
	const faviconPath = `${serverOutputPath.substr(1)}/${faviconFilename}`;

	return {
		method: 'GET',
		path: '/favicon.ico',
		config: {
			auth: false,
		},
		handler: {
			file: faviconPath,
		},
	};
}

function getStaticRoute() {
	return {
		method: 'GET',
		path: `${appConfig.asset_server.path}/{param*}`,
		config: {
			auth: false,
		},
		handler: {
			directory: {
				path: 'build/browser-app/',
				listing: false,
			},
		},
	};
}

// simple 200 response for all lifecycle requests
// https://cloud.google.com/appengine/docs/flexible/python/how-instances-are-managed#health_checking
function getAppEngineLifecycleRoutes() {
	return {
		method: 'GET',
		path: '/_ah/{param*}',
		config: { auth: false },
		handler: (request, reply) => reply('OK'),
	};
}

function getRoutes() {
	const assetPublicPath = `//${appConfig.asset_server.host}:${appConfig.asset_server.port}${appConfig.asset_server.path}`;

	const routes = [
		getFaviconRoute(),
		getServiceWorkerRoute(assetPublicPath),
		getStaticRoute(),
		getAppEngineLifecycleRoutes(),
	];

	return routes;
}

/**
 * The actual configure-and-start function
 *
 * @param {Function} getConfig a function that returns a config object in a Promise
 * @return {Promise} a Promise that returns the started server
 */
export default function main() {
	const plugins = [Inert]; // for serving the favicon
	const routes = getRoutes();

	return startServer(serverAppMap, { routes, plugins }).catch(err => {
		// catch because otherwise Node swallows errors in Promises
		throw err;
	});
}
