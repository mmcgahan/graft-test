import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer as HotModuleReload } from 'react-hot-loader';
import BrowserApp from 'meetup-web-platform/lib/components/BrowserApp';
import makeRootReducer from 'meetup-web-platform/lib/reducers/platform';
import {
	getInitialState,
	getBrowserCreateStore,
} from 'meetup-web-platform/lib/util/createStoreBrowser';

/**
 * Get the function that will render the application. This is set up as a
 * Promise so that any synchronous code that prepares the environment will
 * complete before rendering happens, e.g. polyfills
 *
 * Note: HotModuleReload will automatically disable itself in production
 *
 * @param {Array} routes the app routes
 * @param {Object} appReducers map of state props to reducer functions
 * @return {Promise} a Promise that resolve with the renderer
 */
function renderApp(routes, appReducers) {
	const reducer = makeRootReducer(appReducers);
	const middleware = [];
	const basename = window.APP_RUNTIME.baseUrl || '';
	const createStore = getBrowserCreateStore(routes, middleware, basename);
	const store = createStore(reducer, getInitialState(window.APP_RUNTIME));

	const app = (
		<HotModuleReload>
			<BrowserApp
				routes={routes}
				store={store}
				basename={basename}
			/>
		</HotModuleReload>
	);
	return Promise.resolve(app)
		.then(app => {
			ReactDOM.render(
				app,
				document.getElementById('outlet')
			);
		});
}

export default renderApp;

