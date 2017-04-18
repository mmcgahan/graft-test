import React from 'react';
import TestUtils from 'react-addons-test-utils';
import StaticRouter from 'react-router-dom/StaticRouter';
import PlatformApp from 'meetup-web-platform/lib/components/PlatformApp';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MOCK_APP_STATE } from 'meetup-web-mocks/lib/app';

export const createFakeStore = fakeData => ({
	getState() {
		return fakeData;
	},
	dispatch() {},
	subscribe() {},
});

const intlRenderBase = (component, context={}) => (
	<IntlProvider defaultLocale='en-US' locale='en-US'>
		{component}
	</IntlProvider>
);

export const intlRender = (component, state=MOCK_APP_STATE) => {
	const FAKE_STORE = createFakeStore(state);
	const context = {};

	return TestUtils.renderIntoDocument(
		intlRenderBase(
			<StaticRouter
				location={location}
				context={context}
			>
				<Provider store={FAKE_STORE}>
					{component}
				</Provider>
			</StaticRouter>
		)
	);
};

export const findComponentsWithType = (tree, typeString) =>
	TestUtils.findAllInRenderedTree(
		tree,
		(component) => component && component.constructor.name === typeString
	);

/**
 * Curry a function that takes a React Router route config and a location to
 * render, and return a Promise that resolves with the rendered React app
 *
 * @param {Array} route React Router v4 route config
 * @return {Promise} Promiese that resolves all matched routes for the app
 *
 * @example
 * ```
 * const renderLocation = routeRenderer(route);
 * renderLocation('/').then(app => ...);
 * renderLocation('/foo').then(app => ...);
 * ```
 */
export const routeRenderer = route => (location, state=MOCK_APP_STATE) =>
	new Promise((resolve, reject) => {
		const FAKE_STORE = createFakeStore(state);
		const context = {};
		const component = intlRenderBase(
			<StaticRouter
				location={location}
				context={context}
			>
				<PlatformApp store={FAKE_STORE} routes={[route]} />
			</StaticRouter>
		);

		const app = TestUtils.renderIntoDocument(component);
		return resolve(app, context);
	});

