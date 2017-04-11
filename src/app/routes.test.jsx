import routes from './routes';

import {
	routeRenderer,
	findComponentsWithType,
} from '../util/testUtils';

describe('base routes', () => {
	const renderLocation = routeRenderer(routes);
	it('renders an Index page at `/`', function() {
		return renderLocation('/')
			.then(app => {
				const indexComponent = findComponentsWithType(app, 'PageWrap');
				expect(indexComponent.length).toBe(1);
			});
	});

	it('renders a Login page at `/login`', function() {
		return renderLocation('/login')
			.then(app => {
				const indexComponent = findComponentsWithType(app, 'Login');
				expect(indexComponent.length).toBe(1);
			});
	});

});

