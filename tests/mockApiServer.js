const Hapi = require('hapi');
const api = require('meetup-web-mocks/lib/api');
const config = require('./mockConfig');

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

const getRoutes = config => {
	const getDelayedHandler = makeDelayedHandler(config.API_DELAY);
	return [
		...getGroupRoutes(getDelayedHandler),
		getDefaultRoute(getDelayedHandler)
	];
};

const main = () => {
	const server = new Hapi.Server();

	const apiConnection = server.connection({
		port: config.API_PORT,
	});
	apiConnection.route(getRoutes(config));
	return server.start()
		.then(() => console.log(`Mock API server running on ${server.info.uri}...`))
		.then(() => server);
};

main();

