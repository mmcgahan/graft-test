# Meetup Web Platform application

## Docs

- [Build/bundling the app](docs/build.md)
- [Forking a platform application repo](docs/forking.md)
- [Production server management with Kubernetes](docs/kubernetes.md)
- [Load testing](docs/loadTesting.md)

## Installation

1. Install Node v7. If you
	you don't have Node installed already, use the [current package
	installer](https://nodejs.org/en/download/current/) for your system.
	If you already have Node installed using a package manager like
	Homebrew, you can use that to update the install, although some people
	have reported challenges getting the Homebrew configuration to work.

  Confirm you are running `node` v7

		```sh
		$ node -v
		```

2. Clone this repo

		```sh
		$ git clone git@github.com:meetup/web-platform-starter.git
		```

3. Install [`yarn`](https://yarnpkg.com/en/docs/install). For macOS, the
best way to install is with Homebrew. *DO NOT* install with `npm` - the
installation is unreliable. Yarn is required, and though `npm` will
continue to work, it should not be used.

		```sh
		brew update
		brew install yarn
		```

4. Install the package dependencies

		```sh
		$ yarn install
		```

5. Configure your environment

  Configuration is read from environment variables, which must be
  declared in `.mupweb.config` in your home directory (i.e.
  `$HOME/.mupweb.config`) in the following format:

  ```
  MUPWEB_OAUTH_KEY=<check with an admin>
  MUPWEB_OAUTH_SECRET=<check with an admin>
  PHOTO_SCALER_SALT='<check with admin>'  # single quotes are required
  ```

6. Add `.mupweb.config` to your shell config file

  To automatically add these env variables into your terminal session,
  `source` the config file in your `.bashrc` or `.zshrc`:

  ```
  set -a  # auto-export all subequent env variable assignments
  source $HOME/.mupweb.config
  set +a  # turn off auto-export of env variables
  ```

  If you run the application in Docker, these environment variables will
  be read directly from `$HOME/.mupweb.config` rather than from the
  terminal session environment.

## Usage

You can run this application locally in Node v7. Deployment is handled by
Travis CI using a Docker container.

## Quick start

0. Add this mapping to your `/etc/hosts/` file:
```
127.0.0.1	 beta2.dev.meetup.com
```
1. Start dev app and asset servers with `yarn run start` - URL will be shown in the
terminal once the servers are running ([http://http://beta2.dev.meetup.com:8000/](http://beta2.dev.meetup.com:8000/))
2. Run `yarn run tail` to view logs.
3. In a separate screen, run `yarn run generate` if you wish to start on a new feature.
4. When you make code changes you will need run `yarn start` again to bounce the
server

> Want to run multiple instances of mup-web on the same machine? Make another
> clone of the repo and set the `DEV_SERVER_PORT` inline with the `yarn run start`
> command:
> `DEV_SERVER_PORT=8123 yarn run start`

## Running in Docker (optional)

In addition to running locally in Node, you can also run the application in
Docker.

1. Install Docker

[Get Docker](https://www.docker.com/) - version 1.9 or above (this can
be installed on the Meetup Dev boxes)

Direct download link for Mac - https://download.docker.com/mac/stable/Docker.dmg

2. Run in Docker

`make package` will build the app server and asset server Docker images
and run associated tests. This is primarily useful for troubleshooting
problems seen in Travis build logs.

`make run-local` will run the app server container and start a bash command line
for local debugging

`make run-local-asset` will run the asset server container for local debugging

## Available `yarn` commands

In general, you should just use `yarn start:dev` to get everything built
and running in development - it will coordinate all of the build + start tasks
in an optimal order.

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

### Generating code with `yarn run generate`

You can generate the boilerplate files for `"features"` (using a single
Container modules assigned to its own route) and
`"components"` (React components not tied to specific features) using `yarn
run generate`.

The command will prompt you for a 'type' (select from the list of
options), and a 'name'. For features, you will also be prompted for a
'route' (url pattern) and a 'unique key' to access the data in state.

For 'features', it

1. creates a new directory in `src/features/`
2. generates
  - `xContainer.jsx` module
  - `xActionCreators.js` module
  - `x.test.jsx` script
  - `xQuery.js` module
  - `xRoutes.js` module

For 'components', it generates the following files in
`src/components/`:

1. `x.jsx` Component JSX module
2. `x.test.jsx` script

**Note:** Most components will live in the [meetup-web-components](https://github.com/meetup/meetup-web-components)
component repo, unless they are specifically for use in the
mup-web application. If unsure, ask any repo maintainers
for recommendations.

## Hot reloading

Most React components should be able to "hot reload" while you edit them during
development - the component updates should appear in your browser almost
instantly when you save the file in your editor. However, not all code changes
can be hot reloaded, which may require re-building (`yarn start`) to see the
effect in the app.

To disable Hot Module Reloading (HMR), set `DISABLE_HMR=true` as an env var and
re-start the server. _Note_: this env var needs to be `export`ed so that it is
available to the background process that runs the server.

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

## Additional features

1. Components Library: We have an extensive and growing library of components that
are used across `*-web` sites. This library also contains many foundational layout
components that are used to build pages within `mup-web`. Refer to
[`meetup-web-components`](https://github.com/meetup/meetup-web-components) for additional docs

2. Design: We also heavily rely on [`swarm-sasstools`](https://meetup.github.io/swarm-sasstools/)
to provide styles Sass tools (mixins, functions, placeholders, vars, and utility classes) for
Swarm Design System used in mup-web

3. Icons Library: mup-web integrates the [`swarm-icons`](https://github.com/meetup/swarm-icons) 
library for any svg icons used within the site

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

## Code style

We use a combination of [Prettier](https://github.com/prettier/prettier) and
[ESLint](http://eslint.org/) to enforce code style. Prettier will automatically
re-format your code on commit, and ESLint will provide any remaining code style
warnings and errors that have no been autoformatted.

It is _strongly recommended_ to integrate both tools into your editor so that
the changes are applied on save and lint errors show up before running tests.

- [Editor integration for
  Prettier](https://github.com/prettier/prettier#editor-integration)
- [Editor integration for
  eslint\_d](https://github.com/mantoni/eslint_d.js#editor-integration)

