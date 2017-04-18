/**
 * Jest will automatically apply this mock for every call to the `request`
 * package when running tests. This means that the network will not be hit by
 * unit/integration tests.
 *
 * The characteristics of the mocked request can be changed by calling
 * `request.__setMockResponse` before each test in order to supply the
 * `response` and `body` arguments to the request package's callback function
 *
 * @example
 * ```
 * // some.test.js
 * import request from 'request';
 *
 * request.__setMockResponse(
 * 	{ headers, statusCode, ... },
 * 	JSON.stringify({ foo: 'bar' })
 * );
 *
 * ...
 * expect(response.foo).toEqual('bar')
 * ```
 *
 * @module mockRequest
 */
let mockResponse = {
	headers: {},
	statusCode: 200,
	elapsedTime: 2,
	request: {
		uri: {
			query: 'foo=bar',
			pathname: '/foo',
		},
		method: 'get',
	},
};
let mockBody = '{}';

const request = jest.fn(
	(requestOpts, cb) =>
		setTimeout(
			() => cb(null, mockResponse, mockBody),
			mockResponse.elapsedTime
		)
);

request.__setMockResponse = (response, body) => {
	mockResponse = response;
	mockBody = body;
};

module.exports = request;

