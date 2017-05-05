import fs from 'fs';
import Inert from 'inert';
import { startServer } from 'meetup-web-platform';
import settings from './webpack/settings.js';
import serverAppMap from '../build/server-app/serverAppMap';
import envConfig from '../src/util/config';

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
	const ASSET_SERVER_HOST = envConfig.asset_server.host;
	const ASSET_SERVER_PORT = envConfig.asset_server.port;
	const ASSET_PATH = envConfig.asset_path;

	const assetPublicPath = `//${ASSET_SERVER_HOST}:${ASSET_SERVER_PORT}${ASSET_PATH}`;

	const routes = [getFaviconRoute(), getServiceWorkerRoute(assetPublicPath)];

	// this is only used when the webpackDevServer isn't being used
	if (envConfig.isDev) {
		routes.push(getDevStaticRoute(ASSET_PATH));
	}

	return routes;
}

/**
 * The actual configure-and-start function
 *
 * @param {Function} getConfig a function that returns a config object in a Promise
 * @return {Promise} a Promise that returns the started server
 */
export default function main(getConfig) {
	const plugins = [Inert]; // for serving the favicon
	const routes = getRoutes();

	return startServer(
		serverAppMap,
		{ routes, plugins },
		getConfig
	).catch(err => {
		// catch because otherwise Node swallows errors in Promises
		throw err;
	});
}
