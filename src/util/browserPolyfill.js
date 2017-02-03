/**
 * This function polyfills `window` by asynchronously loading polyfill packages
 * from npm. Only use this if the third-party polyfill service (e.g.
 * polyfill.io) does not already offer the necessary polyfill
 *
*
 * @return {Promise} a promise that resolves when all polyfils are loaded
 */
export function directPolyfill() {
	const imports = [];  // list of Promises that resolve once the polyfill has been applied
	if (!window.URLSearchParams) {
		imports.push(
			System.import('url-search-params')
				.then(URLSearchParams => window.URLSearchParams = URLSearchParams)
		);
	}
	return Promise.all(imports);
}

/**
 * @param {String} localeCode the 'xx-XX' language code for the app
 * @return {String} the polyfill.io cdn string
 */
export function polyfillServiceUrl(localeCode) {
	const features = [
		'fetch',  // IE, Safari
		'Promise',
		'Intl',
		`Intl.~locale.${localeCode}`,
	];
	const flags = [
		'gated',  // use feature detection in addition to user agent test
	];
	return `https://cdn.polyfill.io/v2/polyfill.min.js?features=${features.join()}&flags=${flags.join()}`;
}

