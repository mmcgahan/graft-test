import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import match from 'react-router/lib/match';
import routes from './loginRoutes';

import { Provider } from 'react-redux';
import { MOCK_APP_STATE } from 'meetup-web-mocks/lib/app';

import {
	intlRender,
	findComponentsWithType,
	createFakeStore,
} from '../../util/testUtils';


describe('LoginContainer', () => {
	it('renders a `LoginForm` when logged out', function (done) {
		const location = '/login';
		const stateAnonymous = { ...MOCK_APP_STATE };
		const store = createFakeStore(stateAnonymous);

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

	it('renders a log out `Button` when logged in', function(done) {
		const location = '/login';
		const self = {
			type: 'member',
			value: {
				id: 1234,
				status: 'active',
			}
		};
		const stateAuthenticated = { ...MOCK_APP_STATE, self };
		const store = createFakeStore(stateAuthenticated);

		match({location, routes}, (err, redirectLocation, renderProps) => {
			const container = intlRender(
				<Provider store={store}>
					<RouterContext {...renderProps} />
				</Provider>
			);

			const buttonComponent = findComponentsWithType(container, 'Button');
			expect(buttonComponent.length).toBe(1);
			done();
		});

	});
});
