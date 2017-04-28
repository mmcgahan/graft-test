import routes from './routes';
import TestUtils from 'react-addons-test-utils';

import PageWrap from '../components/PageWrap';
import LoginContainer from '../app/login/LoginContainer';
import { routeRenderer } from '../util/testUtils';

describe('base routes', () => {
	const renderLocation = routeRenderer(routes[0]);
	it('renders an Index page at `/`', function() {
		return renderLocation('/').then(app => {
			const indexComponent = TestUtils.scryRenderedComponentsWithType(
				app,
				PageWrap
			);
			expect(indexComponent.length).toBe(1);
		});
	});

	it('renders a Login page at `/login`', function() {
		return renderLocation('/login').then(app => {
			const indexComponent = TestUtils.scryRenderedComponentsWithType(
				app,
				LoginContainer
			);
			expect(indexComponent.length).toBe(1);
		});
	});
});
