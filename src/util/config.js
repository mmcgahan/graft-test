const fs = require('fs');
const convict = require('convict');
const path = require('path');

/**
 * @module config
 */
const config = convict({
	env: {
		format: ['production', 'development', 'test'],
		default: 'development',
		env: 'NODE_ENV',
	},
	asset_path: {
		format: String,
		default: '/static',
		env: 'ASSET_PATH',
	},
	asset_server: {
		host: {
			format: String,
			default: 'beta2.dev.meetup.com',
			env: 'ASSET_SERVER_HOST',
		},
		port: {
			format: 'port',
			default: 8001,
			env: 'ASSET_SERVER_PORT',
		},
	},
	disable_hmr: {
		format: Boolean,
		default: false,
		env: 'DISABLE_HMR',
	},
	isDev: {
		format: Boolean,
		default: true,
	},
	isProd: {
		format: Boolean,
		default: false,
	},
});

// Load environment dependent configuration
const configFile = path.resolve(
	process.cwd(),
	`config.${config.get('env')}.json`
);

if (fs.existsSync(configFile)) {
	config.loadFile(configFile);
}

config.set('isProd', config.get('env') === 'production');
config.set('isDev', config.get('env') === 'development');
config.validate();

module.exports = config.getProperties();
