# The build

We are using [Webpack](https://webpack.js.org) to bundle our static assets.

The configuration for the Webpack builds are created by node-runnable scripts
in the `scripts/webpack/` directory. The configuration modules export functions
that take a `localeCode` and produce a corresponding Webpack configuration
object. 

## Dev

In dev, we typically don't need a complete build of the application, e.g. we
don't need versioned static assets, multiple language builds, and minification.

We can also activate some dev-friendly features like Hot Module Reloading (HMR)
and rebuilding/restarting the app server when files change. These features are
all bundled into a single `yarn` command:

```
yarn start:dev
```

This command clears the `build/` directory, and starts the dev servers, logging
all output to a single terminal window. Killing the process also stops the
servers.

### Description

The complete application requires 3 bundles:

A. Browser application
B. Server application (mostly the same as A)
C. Node app server

Each of these bundles has its own configuration, and both (A) and (B) can be
split into multiple independent languages bundles that resolve TRN
dependencies independently.

In dev, each bundle is compiled by Webpack in 'watch mode', meaning that the
`entry` script and its dependencies will be watched for changes, and the
bundle will be rebuilt immediately.

In addition to bundling, the bundles must be _served_.

The Browser application (A) is compiled, watched, and served by the Webpack
Dev Server. The Server application and Node app server are bundled by
separate compilers, and then served by a process that can be restarted when
a new bundle is created.

This script manages all aspects of the dev server:

1. Start the Webpack Dev Server for the Browser application bundle (A)\*
2. Start the Webpack watch-mode compiler for the Server application (B)
3. Start the Webpack watch-mode compiler for the Node app server (C)
4. Start the Node app server when (B) is built\*
5. Start the Node app server when (C) is built\*
6. _Re_-start the Node app server when (B) is _re_-built
7. _Re_-start the Node app server when (C) is _re_-built

_\*: **Child process**_

### Assumptionso

1. You only want to build a single language (This could probably be enabled)
2. The bundle filenames are not hashed (This might be allowable if we work our ManifestPlugin)
3. You will not be adding new translations (not relevant to the starter kit, but
   we'll need to account for it in mup-web - shouldn't be too difficult)

### References

- Webpack Node API for compiling in watch mode: https://webpack.js.org/api/node/#watching
- Configuring watch mode behavior: https://webpack.js.org/configuration/watch/#watchoptions
- Webpack Dev Server: https://webpack.js.org/configuration/dev-server/


