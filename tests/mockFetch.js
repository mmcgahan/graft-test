const nodeFetch = require('node-fetch');
const fetchResponse = (mockResponseValue={}, headers={}, delay=0) =>
	new Promise((resolve, reject) =>
		setTimeout(() => resolve({
			text: () => Promise.resolve(JSON.stringify(mockResponseValue)),
			json: () => Promise.resolve(mockResponseValue),
			headers: {
				get: key => headers[key],
			},
		}), delay)
	);

/**
 * override global.fetch, which needs to deal with:
 * 1. Fake API proxy route responses - should avoid this
 * 2. Fake OAUTH_AUTH response
 * 3. Fake OAUTH_ACCESS response
 * @param {String} url the url to fetch
 * @param {Object} options the fetch options
 * @return {Response} a WHATWG Response object (or Promise-based mock)
 */
const mockFetch = (url, options) => {
	if (url.startsWith(process.env.OAUTH_AUTH_URL)) {
		console.warn('MOCK fetch auth code');
		return fetchResponse({ code: 'code_foo' }, {}, 250);
	}
	if (url.startsWith(process.env.OAUTH_ACCESS_URL)) {
		console.warn('MOCK fetch access_token');
		return fetchResponse({ access_token: 'access_bar' }, {}, 250);
	}
	if (url.startsWith('http://beta2.dev')) {
		return nodeFetch(url, options);
	}
	console.warn(`MOCK fetch ${url}`);
	return fetchResponse();
};

module.exports = mockFetch;

