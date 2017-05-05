const chalk = require('chalk');
const platformConfig = require('meetup-web-platform/lib/util/config').default;

const protocol = platformConfig.dev_server.protocol;
const host = platformConfig.dev_server.host;
const port = platformConfig.dev_server.port;

console.log(`\n${chalk.blue('yarn run tail')} to tail the logs`);
console.log(`${chalk.blue('yarn run start:all')} to bounce`);
console.log(`${chalk.blue('yarn stop')} to stop`);
console.log(`${chalk.green(`${protocol}${host}:${port}/`)} app server started`);
