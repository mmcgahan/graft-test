import React from 'react';
import TestUtils from 'react-addons-test-utils';
import RouterContext from 'react-router/lib/RouterContext';
import match from 'react-router/lib/match';
import routes from './loginRoutes';

import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MOCK_APP_STATE } from 'meetup-web-mocks/lib/app';

import {
	findComponentsWithType,
	createFakeStore,
} from 'meetup-web-platform/lib/util/testUtils';

function intlRender(component) {
	return TestUtils.renderIntoDocument(
		<IntlProvider locale='en-US'>
			{component}
		</IntlProvider>
	);
}

describe('LoginContainer', () => {
	it('renders a `LoginForm` when logged out', function (done) {
		const location = '/login';

		const stateAuthenticated = { ...MOCK_APP_STATE };
		const store = createFakeStore(stateAuthenticated);

		match({location, routes}, (err, redirectLocation, renderProps) => {
			const container = intlRender(
				<Provider store={store}>
					<RouterContext {...renderProps} />
				</Provider>
			);

			const loginComponent = findComponentsWithType(container, 'LoginForm');
			expect(loginComponent.length).toBe(1);
			done();
		});
	});

	it('renders a log out `Link` when logged in', function(done) {
		const location = '/login';
		const app = {
			self: {
				type: 'member',
				value: {
					id: 1234,
					status: 'active',
				}
			}
		};

		const stateAuthenticated = { ...MOCK_APP_STATE, app };
		const store = createFakeStore(stateAuthenticated);

		match({location, routes}, (err, redirectLocation, renderProps) => {
			const container = intlRender(
				<Provider store={store}>
					<RouterContext {...renderProps} />
				</Provider>
			);

			const logoutComponent = TestUtils.scryRenderedDOMComponentsWithTag(container, 'a');
			expect(logoutComponent.length).toBe(1);
			done();
		});

	});
});
