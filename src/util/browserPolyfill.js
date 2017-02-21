/**
 * @param {String} localeCode the 'xx-XX' language code for the app
 * @return {String} the polyfill.io cdn string
 */
export function polyfillServiceUrl() {
	const features = [
		'fetch',  // IE, Safari
		'Promise',
		'URL',
		'Array.prototype.find', // IE
		'Array.from', // IE
	];
	const flags = [
		'gated',  // use feature detection in addition to user agent test
	];
	return `https://cdn.polyfill.io/v2/polyfill.min.js?features=${features.join()}&flags=${flags.join()}`;
}

