# The build

We are using [Webpack](https://webpack.js.org) to bundle our static assets.

The configuration for the Webpack builds are created by node-runnable scripts in the
`scripts/webpack/` directory. The modules export functions that take a `localeCode`
and produce a corresponding Webpack configuration object. Hot module reloading
in development is provided by the Webpack dev server, which is run from its
Node API in `webpack/webpackDevServer.js`.



