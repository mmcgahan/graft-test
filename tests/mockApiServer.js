const api = require('meetup-web-mocks/lib/api');

const makeDelayedHandler = delay => payload => (request, reply) => {
	setTimeout(() => reply(payload), delay);
};

const getGroupRoutes = getDelayedHandler => ([{
	method: 'GET',
	path: '/{urlname}',
	handler: getDelayedHandler(api.MOCK_GROUP)
}]);

const getDefaultRoute = getDelayedHandler => ({
	method: ['GET', 'POST'],
	path: '/{wild*}',
	handler: getDelayedHandler({})
});

const getRoutes = options => {
	const getDelayedHandler = makeDelayedHandler(options.delay);
	return [
		...getGroupRoutes(getDelayedHandler),
		getDefaultRoute(getDelayedHandler)
	];
};

const PORT = 8001;
const connect = (server, options) => {
	options = options || {};
	options.delay = options.delay || 200;
	const apiConnection = server.connection({
		port: PORT,
	});
	return apiConnection.route(getRoutes(options));
};

module.exports = {
	connect,
	PORT
};

