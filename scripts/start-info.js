const chalk = require('chalk');

console.log(`\n${chalk.blue('npm run tail')} to tail the logs`);
console.log(`${chalk.blue('npm run start:all')} to bounce`);
console.log(`${chalk.blue('npm stop')} to stop`);
console.log(`${chalk.green(`http://localhost:${process.env.DEV_SERVER_PORT}/`)} app server started`);

