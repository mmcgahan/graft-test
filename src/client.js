import makeRenderer from 'meetup-web-platform/renderers/browser-render';

// the public path to bundled assets is a runtime variable, so is set here
// **before** the app-specific modules are imported. ES6 `import`s are hoisted
// to the start of script execution, which means they cannot be used here.
__webpack_public_path__ = window.APP_RUNTIME.assetPublicPath;  // eslint-disable-line no-undef
const routes = require('./app/routes').default;
const reducer = require('./app/reducer').default;

const render = makeRenderer(routes, reducer);
render();

