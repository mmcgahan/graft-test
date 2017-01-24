const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const mkdirp = require('mkdirp');
require('babel-register');  // process all further imports through babel

function getPath(name) {
	'use strict';
	const nameLcase = name.replace(/^[A-Z]/, (firstLetter) => firstLetter.toLowerCase());
	return path.resolve(__dirname, '../src/app/', nameLcase);
}

function validateFeature(name) {
	const createPath = getPath(name);

	if (mkdirp.sync(createPath) === null) {
		return `${createPath} already exists - please supply a unique feature name`;
	}

	return true;
}

function isRequired(input) {
	if (!input) {
		return 'You must provide a value';
	}
	return true;
}

function promptCreate() {
	const questions = [
		{
			type: 'input',
			name: 'name',
			message: (answers) => 'Name of your feature:',
			validate: validateFeature,
		},{
			type: 'input',
			name: 'route',
			message: 'Feature route (can be changed later):',
			validate: isRequired,
		}, {
			type: 'input',
			name: 'ref',
			message: 'Unique state key (e.g. "foo" will populate state.app.foo)',
			validate: isRequired,
		}
	];

	return inquirer.prompt(questions);
}

promptCreate()
	.then(answers => ({
		answers,
		createPath: getPath(answers.name),
	}))
	.then((config) => {
		'use strict';
		const createPath = config.createPath;
		const ref = config.answers.ref;
		const route = config.answers.route;
		const name = config.answers.name.replace(/^[A-Z]/, (firstLetter) => firstLetter.toUpperCase());
		const nameLcase = name.replace(/^[A-Z]/, (firstLetter) => firstLetter.toLowerCase());
		let filepath;

		console.log('\nWriting feature files:');
		console.log('----------------------------');

		filepath = path.resolve(createPath, `${name}Container.jsx`);
		console.log(filepath);
		fs.writeFileSync(
			filepath,
			require('./templates/container.jsx').default(name)
		);

		filepath = path.resolve(createPath, `${name.toLowerCase()}.test.jsx`);
		console.log(filepath);
		fs.writeFileSync(
			filepath,
			require('./templates/test.feature.jsx').default({ name, route })
		);

		filepath = path.resolve(createPath, `${nameLcase}Query.js`);
		console.log(filepath);
		fs.writeFileSync(
			filepath,
			require('./templates/query.js').default({ name, ref })
		);

		filepath = path.resolve(createPath, `${nameLcase}Routes.js`);
		console.log(filepath);
		fs.writeFileSync(
			filepath,
			require('./templates/routes.js').default({ name, route })
		);

		filepath = path.resolve(createPath, `${nameLcase}ActionCreators.js`);
		console.log(filepath);
		fs.writeFileSync(
			filepath,
			require('./templates/actionCreators.js').default(name)
		);
	})
	.then(
		() => {
			console.log('\nDone! Your feature is set up. Next, configure your query and your routes.\n');
		},
		(err) => {
			console.log(err.stack);
		}
	);
