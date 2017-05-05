import fs from 'fs';
import Inert from 'inert';
import { startServer } from 'meetup-web-platform';
import settings from './webpack/settings.js';

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
	swTemplatePath = `${settings.serviceWorkerOutputPath.substr(1)}/sw.js` // build/sw/sw.js
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

function getDevStaticRoute(assetPath) {
	return {
		method: 'GET',
		path: `${assetPath}/{param*}`,
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

function getRoutes() {
	// read runtime values
	const assetHost = process.env.ASSET_SERVER_HOST || '0.0.0.0';
	const assetPort = process.env.ASSET_SERVER_PORT
		? `:${process.env.ASSET_SERVER_PORT}`
		: '';
	const assetPath = process.env.ASSET_PATH
		? `/${process.env.ASSET_PATH}`
		: '/static';
	const assetPublicPath = `//${assetHost}${assetPort}${assetPath}`;

	const routes = [getFaviconRoute()];
	if (settings.serviceWorkerEnabled) {
		routes.push(getServiceWorkerRoute(assetPublicPath));
	}

	// this is only used when the webpackDevServer isn't being used
	if (settings.isDev) {
		routes.push(getDevStaticRoute(assetPath));
	}

	return routes;
}

/**
 * The actual configure-and-start function
 *
 * @param {Object} appMap a map of locale codes to server rendering observables
 * @return {Promise} a Promise that returns the started server
 */
export default function main(appMap) {
	if (!appMap) {
		appMap = require('../build/server-app/serverAppMap').default;
	}
	const plugins = [Inert]; // for serving the favicon
	const routes = getRoutes();

	return startServer(appMap, { routes, plugins }).catch(err => {
		// catch because otherwise Node swallows errors in Promises
		throw err;
	});
}
