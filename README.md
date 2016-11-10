# web-platform-starter
 
A minimal meetup-web-platform-based application.

This repo can be copied to a new repo to start a new web application. By using
this repo, you will start off with an application that has the same structure
as other 'reference' implementations of the platform, which will make it easier
for engineers who have worked on other applications to get up to speed and use
your app

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
bundle must render markup that includes a script tag for the browser app bundle.
4. A NodeJS-based app server to respond to requests - the platform expects to
run on Hapi, but technically any NodeJS server can be used.

**The `meetup-web-platform` library attempts to help with 2 through 4, but largely
leaves 1 to app developers.**

### Application source: `src/`

This is the meat of your application, with application "entry points" for the
runnable app:

1. `app.js`: the root script that will run your application in the browser
2. `server-app.js`: the rendering script that will run on your app server

Both entry points must be bundled in order to be used on their respective
platforms (browser, NodeJS) - the build-related scripts in `scripts/` help make
this build routine easier to set up, including automatically-versioned browser app
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

