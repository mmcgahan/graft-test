# web-platform-starter
 
A minimal meetup-web-platform-based application.

This repo can be forked to start a new web application, or you can copy and
paste the pieces you want. By using this repo, you will start off with an
application that has the same structure as other 'reference' implementations
of the platform, which will make it easier for engineers who have worked on
other applications to get up to speed and use your app

## Basic usage

1. `npm install`
2. `npm run start:all`
3. go to [http://localhost:8000](http://localhost:8000) to start your adventure

## Features

All Meetup Web Platform applications will have 4 main components:

1. A React/Redux application
2. A browser bundle that will render the React app
3. A server bundle that will render _something_ - this repo uses server-side
rendering through `meetup-web-platform`'s `server-render` module. The server
bundle must render markup that includes a script tag for the client bundle.
4. A NodeJS-based app server to respond to requests - the platform expects to
run on Hapi, but technically any NodeJS server can be used.

**The `meetup-web-platform` library attempts to help with 2 through 4, but largely
leaves 1 to app developers.**

### Application source: `src/`

This is the meat of your application, with application "entry points" for the
runnable app:

1. `client.js`: the root script that will run your application in the browser
2. `server-locale.js`: the rendering script that will run on your app server

Both entry points must be bundled in order to be used on their respective
platforms (browser, NodeJS) - the build-related scripts in `scripts/` help make
this build routine easier to set up, including automatically-versioned client
bundles.

#### `src/app/`

The structure of this directory is entirely up to you - it's just a React app.

#### `src/assets/`

Static files _and SCSS_ that you want to bundle with your app

#### `src/util/`

Any generic modules you want to help run your app.

### `scripts/` - build scripts

Most of the basic scripts help with bundling the application, which can be
challenging to get "right", particularly if you want versioned bundles.

### `util/`

Up to you.

### Config

Most of the files in the root of this repo are configuration files for various
tools that are used during development

1. Jest for unit testing
2. Babel for transpiling ES6
3. ESLint to keep code style consistent

