import { MOCK_APP_STATE } from 'meetup-web-mocks/lib/app';

import loginRoute from './loginRoute';

import {
	routeRenderer,
	findComponentsWithType,
} from '../../util/testUtils';


describe('LoginContainer', () => {
	const renderLocation = routeRenderer([loginRoute]);

	it('renders a `LoginForm` when logged out', function () {
		const stateAnonymous = { ...MOCK_APP_STATE };

		return renderLocation('/login', stateAnonymous)
			.then(container => {
				const loginComponent = findComponentsWithType(container, 'LoginForm');
				expect(loginComponent.length).toBe(1);
			});
	});

	it('renders a log out `Button` when logged in', function() {
		const self = {
			type: 'member',
			value: {
				id: 1234,
				status: 'active',
			}
		};
		const stateAuthenticated = { ...MOCK_APP_STATE, self };

		return renderLocation('/login', stateAuthenticated)
			.then(container => {
				const buttonComponent = findComponentsWithType(container, 'Button');
				expect(buttonComponent.length).toBe(1);
			});
	});
});
