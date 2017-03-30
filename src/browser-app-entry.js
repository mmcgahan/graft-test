import makeBrowserRenderer from 'meetup-web-platform/lib/renderers/browser-render';
import makeRootReducer from 'meetup-web-platform/lib/reducers/platform';
import activateSW from './sw/activateSW';

// the public path to bundled assets is a runtime variable, so is set here
// **before** the app-specific modules are imported. ES6 `import`s are hoisted
// to the start of script execution, which means they cannot be used here.
__webpack_public_path__ = window.APP_RUNTIME.assetPublicPath;  // eslint-disable-line no-undef

/**
 * Get the function that will render the application. This is set up as a
 * Promise so that any synchronous code that prepares the environment will
 * complete before rendering happens, e.g. polyfills
 *
 * @return {Promise} a Promise that resolve with the renderer
 */
function getRenderer() {
	const routes = require('./app/routes').default;
	const appReducers = require('./app/reducer').default;
	const reducer = makeRootReducer(appReducers);
	const renderer = makeBrowserRenderer(
		routes,
		reducer,
		[],
		window.APP_RUNTIME.baseUrl
	);

	return Promise.resolve(renderer);
}

getRenderer().then(renderer => renderer());
activateSW();

