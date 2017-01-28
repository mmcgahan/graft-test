/**
 * @param {Object} localeCode configuration object
 * @return {Object} the `src` and `type` for a `script` tag in React Helmet
 */
export default function getBrowserPolyfill(localeCode) {
	const features = [
		'fetch',  // IE, Safari
		'Promise',
		'Intl',
		`Intl.~locale.${localeCode}`,
	];
	const flags = [
		'gated',  // use feature detection in addition to user agent test
	];
	return {
		src: `https://cdn.polyfill.io/v2/polyfill.min.js?features=${features.join()}&flags=${flags.join()}`,
		type: 'text/javascript'
	};
}

