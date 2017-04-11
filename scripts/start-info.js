const chalk = require('chalk');

console.log(`\n${chalk.blue('yarn run tail')} to tail the logs`);
console.log(`${chalk.blue('yarn run start:all')} to bounce`);
console.log(`${chalk.blue('yarn stop')} to stop`);
console.log(`${chalk.green(`http://beta2.dev.meetup.com/:${process.env.DEV_SERVER_PORT}/`)} app server started`);

