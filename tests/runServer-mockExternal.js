const mockConfig = require('./mockConfig');
const mockFetch = require('./mockFetch');
const getConfig = require('meetup-web-platform/lib/util/config').default;
//
// import the runServer module, which will set global.fetch
const runServer = require('../build/app-server').default;

// re-set global.fetch with mocking function
global.fetch = mockFetch;

console.log(process.pid);

const config = () => getConfig({
	API_PROTOCOL: 'http',
	API_HOST: 'beta2.dev.meetup.com',
	API_SERVER_ROOT_URL: `http://beta2.dev.meetup.com:${mockConfig.API_PORT}`
});

runServer(config);

