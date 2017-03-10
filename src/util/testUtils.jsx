import React from 'react';
import TestUtils from 'react-addons-test-utils';
import RouterContext from 'react-router/lib/RouterContext';
import match from 'react-router/lib/match';

import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';

import { MOCK_APP_STATE } from 'meetup-web-mocks/lib/app';

export const findComponentsWithType = (tree, typeString) =>
	TestUtils.findAllInRenderedTree(
		tree,
		(component) => component && component.constructor.name === typeString
	);

export const createFakeStore = fakeData => ({
	getState() {
		return fakeData;
	},
	dispatch() {},
	subscribe() {},
});

/**
 * Curry a function that takes a set of React Router routes and a location to
 * render, and return a Promise that resolves with the rendered React app
 *
 * @param {Array} routes React Router v4 routes config
 * @return {Promise} Promiese that resolves all matched routes for the app
 *
 * @example
 * ```
 * const renderLocation = routeRenderer(routes);
 * renderLocation('/').then(app => ...);
 * renderLocation('/foo').then(app => ...);
 * ```
 */
export const routeRenderer = routes => (location, state=MOCK_APP_STATE) =>
	new Promise((resolve, reject) =>
		match({ location, routes }, (err, redirectLocation, renderProps) => {
			const FAKE_STORE = createFakeStore(state);
			const app = TestUtils.renderIntoDocument(
				<IntlProvider locale='en'>
					<Provider store={FAKE_STORE}>
						<RouterContext {...renderProps} />
					</Provider>
				</IntlProvider>
			);
			resolve(app);
		})
	);
