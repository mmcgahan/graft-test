import 'rxjs';  // enables all RxJS operators in dependencies
import makeBrowserRenderer from 'meetup-web-platform/lib/renderers/browser-render';
import makeRootReducer from 'meetup-web-platform/lib/reducers/platform';
import activateSW from './sw/activateSW';
import { directPolyfill } from './util/browserPolyfill';

// --- app reducers ---
import appReducers from './app/reducer';

// the public path to bundled assets is a runtime variable, so is set here
// **before** the app-specific modules are imported. ES6 `import`s are hoisted
// to the start of script execution, which means they cannot be used here.
__webpack_public_path__ = window.APP_RUNTIME.assetPublicPath;  // eslint-disable-line no-undef

/**
 * The function that will configure and render the application
 * @return {undefined} side effect only
 */
function getRenderer() {
	const routes = require('./app/routes').default;
	const reducer = makeRootReducer(appReducers);

	return makeBrowserRenderer(routes, reducer, [], window.APP_RUNTIME.baseUrl);
}

directPolyfill()
	.then(getRenderer)
	.then(render => render());

activateSW();

