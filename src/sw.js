// The cache name needs to update every time there is a new bundle to serve,
// so we need to inject the browser bundle hash as part of the cache name
const buildHash = WEBPACK_BROWSER_BUILD_HASH;  // eslint-disable-line no-undef
const staticCacheName = `mup-web-${buildHash}`;
const imgCacheName = 'mup-web-imgs';
const assetPublicPath = ASSET_PUBLIC_PATH;  // eslint-disable-line no-undef
const skeletonPath = '/?skeleton';

const allCaches = [
	staticCacheName,
	imgCacheName,
];

/**
 * Service worker installation handler. Main responsibility is to cache assets
 * that might be needed by an initial request to the application - the markup
 * for the application shell, the core app bundle, and as many async assets as
 * we can get.
 */

const assetFilePaths = WEBPACK_BROWSER_ASSET_PATHS;  // eslint-disable-line no-undef
const browserAppBundles = [
	...assetFilePaths
].map(filename =>
	`${assetPublicPath}${filename}`
);

self.addEventListener('install', e => {
	e.waitUntil(
		caches.open(staticCacheName)
			.then(cache => cache.addAll([ skeletonPath, ...browserAppBundles ]))
			.catch(
				// if caching fails, discard SW
			)
	);
});

self.addEventListener('activate', e => {
	e.waitUntil(
		caches.keys().then(cacheNames =>
			Promise.all(
				cacheNames.filter(cacheName =>
					cacheName.startsWith('mup-web-') &&
					!allCaches.includes(cacheName)
				)
				.map(caches.delete.bind(caches))
			)
		)
	);
});

function servePhoto(request) {
	// check for match
	return caches.open(imgCacheName).then(cache =>
		cache.match(request)
			.then(match =>
				// return response if match
				match ||
				// otherwise go get image
				fetch(request.url).then(response => {
					// add to cache and return to Promise
					cache.put(request, response.clone());
					return response;
				})
			)
		);
}

/**
 * The browser request hijacker. If an asset is requested that is in the cache,
 * immediately respond with the cached asset, otherwise forward the `request`
 * to the network with `fetch`.
 */
self.addEventListener('fetch', e => {
	const nonAppRoutes = ['/api', '/sw.js'];

	const requestUrl = new URL(e.request.url);

	// check for app fetches
	if (
		requestUrl.origin === location.origin &&
		!nonAppRoutes.some(route => requestUrl.pathname === route)
	) {
		e.respondWith(caches.match(skeletonPath));
		return;
	}

	if (requestUrl.href.indexOf('meetupstatic.com') > -1) {
		e.respondWith(servePhoto(e.request));
		return;
	}

	e.respondWith(
		caches.match(e.request)  // this will supply cached static assets
			.then(response => response || fetch(e.request))
	);
});

