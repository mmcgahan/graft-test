import TestUtils from 'react-addons-test-utils';

import Button from 'meetup-web-components/lib/forms/Button';
import LoginForm from 'meetup-web-components/lib/LoginForm';

import { MOCK_APP_STATE } from 'meetup-web-mocks/lib/app';
import { routeRenderer } from 'src/util/testUtils';

import route from './loginRoute';

describe('LoginContainer', () => {
	const renderLocation = routeRenderer(route);

	it('renders a `LoginForm` when logged out', function () {
		const stateAnonymous = { ...MOCK_APP_STATE };

		return renderLocation('/login', stateAnonymous)
			.then(container => {
				const loginComponent = TestUtils.scryRenderedComponentsWithType(container, LoginForm);
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
				const buttonComponent = TestUtils.scryRenderedComponentsWithType(container, Button);
				expect(buttonComponent.length).toBe(1);
			});
	});
});
