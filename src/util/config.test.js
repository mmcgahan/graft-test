import config from './config';

describe('config', () => {
	it('is a valid JS object', () => {
		expect(config).toBeTruthy();
		expect(config).toBeInstanceOf(Object);
	});

	it('has values for all env variables', () => {
		expect(config.env).toBeTruthy();
		expect(config.asset_path).toBeTruthy();
		expect(config.asset_server).toBeTruthy();
		expect(config.asset_server.host).toBeTruthy();
		expect(config.asset_server.port).toBeTruthy();
		expect(config.disable_hmr).toBeDefined();
		expect(config.isDev).toBeDefined();
		expect(config.isProd).toBeDefined();
	});
});
