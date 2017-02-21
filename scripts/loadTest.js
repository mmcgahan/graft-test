const child_process = require('child_process');
// check for build
// build if no current build available
// log last modified time of build that will be used
// start mock app server process (A)
const appServer = child_process.spawn('node', ['--inspect', 'tests/runServer-mockExternal.js']);
appServer.stderr.on('data', data => {
	const chromeLink = data.toString().match(/chrome.+/);
	if (chromeLink) {
		console.log('Open the following link in Chrome to inspect the server');
		console.log(chromeLink[0], '\n');
	}
});
appServer.on('close', (code, signal) => {
	console.log(`App server exited with code ${code} and signal ${signal}`);
});
// start mock API server process (B)
const apiServer = child_process.spawn('node', ['tests/mockApiServer.js']);
apiServer.on('close', (code, signal) => {
	console.log(`API server exited with code ${code} and signal ${signal}`);
});

function runTest(c, n, url) {
	return () => new Promise((resolve, reject) => {
		const command = `ab -l -c ${c} -n ${n} -H "Accept-Encoding: gzip,deflate" ${url}`;
		const abTest = child_process.exec(command);
		abTest.stdout.on('data', data => {
			const match = data.toString().match(/Requests per second[^\d]+([\d.]+)[^T]+Time per request[^\d]+([\d.]+)/);
			if (match) {
				console.log(`concurrency ${c}:`);
				console.log(`  ${match[1]}req/s`);
				console.log(`  ${match[2]}ms mean RT\n`);
			}
		});
		abTest.on('close', (code, signal) => {
			resolve();
		});
	});
}

function runTests() {
	// sequentially execute `ab` with desired args
	// const concurrency = [10, 20, 50, 100];
	const n = 300;
	const url = 'http://beta2.dev.meetup.com:8000/';

	console.log('Running tests...');
	return runTest(10, n, url)()
		.then(runTest(20, n, url))
		.then(runTest(50, n, url))
		.then(runTest(100, n, url))
		.catch((err) => {
			console.error(err);
		});
}

appServer.stdout.on('data', data => {
	const ready = data.indexOf('Dev server is listening') > -1;
	if (ready) {
		runTests()
			.then(() => {
				console.log('Tests complete - type ^C to shut down mock servers and exit');
			});
	}
});
