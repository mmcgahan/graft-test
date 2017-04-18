import React from 'react';
import TestUtils from 'react-addons-test-utils';
import StaticRouter from 'react-router-dom/StaticRouter';
import PlatformApp from 'meetup-web-platform/lib/components/PlatformApp';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MOCK_APP_STATE } from 'meetup-web-mocks/lib/app';

/**
 * Given an app state object, return a redux store object
 *
 * @param {Object} fakeData App state data
 * @return {Object} A Redux Store object
 */
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

/**
 * Render a React component within a detached DOM node
 * and provide both a Redux Store and Intl Wrapper that defaults to 'en-US'
 *
 * @param {ReactEl} component React component to render
 * @param {Object} state Optional data to render within a fake redux store
 * @return {DOM} detached DOM node with component rendered within
 */
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

/**
 * Curry a function that takes a React Router route config and a location to
 * render, and return a Promise that resolves with the rendered React app
 *
 * @param {Object} route React Router v4 route config
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

