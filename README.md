# web-platform-starter

A minimal meetup-web-platform-based application.

This repo can be copied to a new repo to start a new web application. By using
this repo, you will start off with an application that has the same structure
as other 'reference' implementations of the platform, which will make it easier
for engineers who have worked on other applications to get up to speed and use
your app

# Installation - setting up a new app repo

One way to set up a new copy of the repo is to first clone it and then set up
a new 'remote' `origin` that you create on GitHub.

1. In GitHub, create a new, _empty_ repository.
2. On your local machine, clone the starter kit into a directory with the name
of your new GitHub repo

    ```sh
    > git clone git@github.com:meetup/web-platform-starter.git my-cool-app
    > cd my-cool-app
    ```

3. set the `origin` remote url to your new GitHub repo url

    ```sh
    > git remote set-url origin git@github.com:meetup/my-cool-app.git
    ```

4. push the code to the new repo and set the upstream tracking branch

    ```sh
    > git push origin -u
    ```

5. In general, you will probably want to have the option of pulling updates
to the starter repo into your own copy - these updates might include build
improvements, dependency updates, and React application helpers. It's therefore
useful to set this repo as an additional `upstream` remote:

    ```sh
    > git remote add upstream git@github.com:meetup/meetup-web-starter.git
    ```

		To pull updates:

    ```sh
    > git pull upstream master
    ```

## Runtime

You can run starter-based apps locally in Node v6.7.0. Deployment will
typically require a Docker-based CI configuration.

1. Install the latest version of Node (v6.7.0 or higher). If you
	you don't have Node installed already, use the [current package
	installer](https://nodejs.org/en/download/current/) for your system.
	If you already have Node installed using a package manager like
	Homebrew, you can use that to update the install, although some people
	have reported challenges getting the Homebrew configuration to work.
2. Confirm you are running `node` v6.7.0 or higher

		```sh
		$ node -v
		```
3. Install [yarn](https://yarnpkg.com/en/docs/install). For macOS, the
best way to install is with Homebrew. *DO NOT* install with `npm`,the
installation is unreliable. `Yarn` is required, and though `npm` will
continue to work, it should not be used.

		```sh
		brew update
		brew install yarn
		```
2. Install all the `package.json` dependencies using `yarn`

		```sh
		$ yarn install
		```

## Environment config

In addition to the [web platform environment
variables](https://github.com/meetup/meetup-web-platform#environment-config),
your app should also contain app-specific coverage reporting with coveralls.io.

```
COVERALLS_REPO_TOKEN=<set up a new coveralls repo at https://coveralls.io/github/meetup/>
COVERALLS_SERVICE_NAME=<your username>
```

If you run the application in Docker, these environment variables will
be read directly from `$HOME/.mupweb.config` rather than from the
terminal session environment.

# Usage

## Quick start

1. Start dev app and asset servers with `yarn run start` - URL will be shown in the
terminal once the servers are running ([http://localhost:8000](http://localhost:8000))
2. Run `yarn run tail` to view logs.
3. When you make code changes you will need run `yarn start` again to bounce the
server

> Want to run multiple instances of mup-web on the same machine? Make another
> clone of the repo and set the `DEV_SERVER_PORT` inline with the `yarn run start`
> command:
> `DEV_SERVER_PORT=8123 yarn run start`

## Available yarn commands

In general, you should just use `yarn run start` to get everything built
and running in development - it will coordinate all of the build + start tasks
in an optimal order.

The app server needs to `build:locales` + `build:server` + `start:app`.

The asset server needs to `build:locales` + `start:asset`.

**Important** you can run `start:all` with CLI arguments for each localeCode
you want to build - by default, it will build all supported locales, which is
slower. See [example below](#start-commands)

### Build commands

You can `yarn run` the following commands:

- `build:clean`: Completely remove all build artifacts
- `build:locales`: Build both the _client_ and _server_ locale-specific bundles
that contain the React web application.
- `build:server`: Build the app server, which will import the locale-specific
bundles created by `build:locales`
- `build:trns`: Extract trns from source files. Output in `build/trns/`.
- `build:uploadtrns`: Send un-translated TRN definitions to transifex

### Start commands

- `yarn run start`: Build en-US server and client bundles and start up the app
and dev asset server.
- `yarn run start:prod`: Start the bundled app server (used in production - in general you
should use `yarn start` or `yarn run start:app` in development)
- `yarn run start:all`: Same as `yarn start`, but builds all locales.
  Optionally, you can optionally pass localeCodes as CLI arguments
  to build/run a subset of locales.

	```sh
	yarn run start:all -- en-US es  # build only US English and Spanish
	```

- `yarn run start:app`: Start the dev app server as a background process
- `yarn run start:asset`: Start the dev asset server as a background process
  - accepts localeCode arguments, e.g. `yarn run start:asset -- en-US es`
- `yarn run stop`: Stop all app and asset servers started by `yarn run start:all`

## App features

All Meetup Web Platform applications will have 4 main components:

1. A React/Redux application
2. A browser bundle that will render the React app
3. A server bundle that will render _something_ - this repo uses server-side
rendering through `meetup-web-platform`'s `server-render` module. The server
bundle must render markup that includes a script tag for the browser app bundle.
4. A NodeJS-based app server to respond to requests - the platform expects to
run on Hapi, but technically any NodeJS server can be used.

**The `meetup-web-platform` library attempts to help with 2 through 4, but largely
leaves 1 to app developers.**

### Application source

See the [`src/README`](src/README.md) for full documentation.

#### `scripts/` - build scripts

Most of the basic scripts help with bundling the application, which can be
challenging to get "right", particularly if you want versioned bundles.

#### `util/`

Up to you.

### Config

Most of the files in the root of this repo are configuration files for various
tools that are used during development

1. Jest for unit testing
2. Babel for transpiling ES6
3. ESLint to keep code style consistent

## Asset bundling

We are using [Webpack](https://webpack.github.io/) to bundle
our Javascript modules.

The configuration for the Webpack builds are created by node-runnable scripts in the
`scripts/webpack/` directory. The modules export functions that take a `localeCode`
and produce a corresponding Webpack configuration object. Hot module reloading
in development is provided by the Webpack dev server, which is run from its
Node API in `webpack/webpackDevServer.js`.

## Development tips

### Recommended Dev Tools

- Node Version Manager - https://github.com/creationix/nvm
- React Developer Tools (browser plugin) - https://github.com/facebook/react-devtools
- Redux Dev Tools ([Chrome browser
  extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd))
- ES6 + JSX syntax highlighting/linting plugin for your editor
	- vim
		- [pangloss/vim-javascript](https://github.com/pangloss/vim-javascript) + [mxw/vim-jsx](https://github.com/mxw/vim-jsx)
	- Sublime Text
		- [babel-sublime](https://github.com/babel/babel-sublime)
- An ESLint-aware editor plugin
	- vim
		- [syntastic](https://github.com/scrooloose/syntastic) + [eslint_d](https://github.com/mantoni/eslint_d.js) for vim
			- Install eslint_d: `npm install -g eslint_d`
			- Configure vim plugins, e.g. with Vundle:
			```vim
			Plugin 'scrooloose/syntastic'
			" ...
			let g:syntastic_javascript_checkers = ['eslint']
			let g:syntastic_javascript_eslint_exec = 'eslint_d'
			```
		- Fix lint problems with custom command `L`
		```vim
		command L execute('silent !eslint_d --fix %')
		\ | execute 'e|redraw!'
		```



### Yarn & package.json Dependencies

- Available [yarn commands](https://yarnpkg.com/en/docs/cli/)
- Anytime you update `package.json` and run `yarn install`,
yarn will automatically generate/update a `yarn.lock` file. When you run
`yarn install`, all the versions of dependencies specified in the lock
file are the ones installed.


### Testing

Tests can be written inside feature directories alongside their source
files, just make sure the test scripts end with `.test.js`. We use
[Jest](https://facebook.github.io/jest/) for testing, which is just a wrapper around
standard [Jasmine](http://jasmine.github.io/) tests.

Run `yarn run test` to run all tests

```sh
$ yarn run test
```

All tests will be run for every pull request opened on GitHub.

#### UI Testing

Unit testing UI components is a little weird compared with unit testing
business logic.

1. You have to decide what aspects of a UI element are intrinsic to its
appearance rather than just implementation details
2. UI elements evolve based on aesthetic tastes as much as functional
requirements - inflexible tests require a lot of maintenance
3. Headless testing of browser-dependent objects requires some extra
tooling to simulate the target environment

##### Simulating interaction

[`TestUtils.Simulate`](https://facebook.github.io/react/docs/test-utils.html#simulate)
appears to work correctly for our testing setup - it should be used for
all tests that involve simulating events, like `onClick`. Check out
`button.test.js` for an example.

##### Verifying child elements

In UI testing, there is an almost invisible line between testing the
implementation (markup) and testing the behavior (appearance/content),
and ideally you only should test the _behavior_ - there are loads of
ways to change markup without changing the fundamental app experience,
and those kinds of markup changes should not be considered "bugs" that
result in failed tests.

The implication for constructing unit tests is that you should avoid
relying on the specific markup (tags and DOM structure). Sometimes it's
unavoidable, but if you are inclined to use `getElementsByTagName`,
`firstChild/lastChild`, or a `querySelector(All)` that includes a tag
name to access particular parts of the component UI, check whether there
is a better way to skip over the markup implementation details and grab
what you want explicitly.

A useful option is to add a PCV `className` to the element of interest,
and just use `youComponentEl.querySelector('.specificClassName')` to
find it. Classnames are free and DOM-independent, which means that no
matter what the markup is for your event name, you can always unit-test
the behavior (text content) accurately with

```js
// good
expect(eventNode.querySelector('.event-name').textContent).toEqual(testEventName);

// bad - assumes both tag (h5) and structure (first h5 in the card)
expect(eventNode.getElementsByTagName('h5')[0].textContent).toEqual(testEventName);
```

### Coverage reports (Coveralls)

Jest provides [code coverage](http://pjcj.net/testing_and_code_coverage/paper.html)
reports in a standard 'lcov' format that can be consumed by code coverage
services like [Coveralls.io](https://coveralls.io). The simplest way to use it
is to run the command

```sh
$ yarn run coverage
```

This will run `jest --coverage`, which runs the unit tests and prints an ASCII
table describing the test coverage in detail. As long as you have the
`COVERALLS_REPO_TOKEN` populated as an environment variable, the command will
also upload the results to our [Coveralls account](https://coveralls.io/github/meetup/mup-web),
which tracks our code coverage over time and integrates with the CI pipeline.

It's useful to look at the coverage report closely for the files that you have
used in your branch - you should be able to see whether your unit tests are
covering all the code paths that you have created. If there are holes, fill
them with more or better unit tests that activate the code as you intended.

We do not have a standard for what our overall coverage percentage should be,
but new code should not be allowed to significantly decrease coverage.

### Linting

To manually lint your code

```sh
$ yarn run lint
```

Whitespace issues will be fixed automatically - just remember to commit
the changes. Other style issues will log errors.

Our `.eslintrc` configuration is based on the 'recommended' preset, with
a number of additional rules that have been requested by the dev team. It's a
'living' standard, however, so please feel free to send PRs with updates!

