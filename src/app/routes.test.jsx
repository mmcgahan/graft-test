import React from 'react';
import TestUtils from 'react-addons-test-utils';
import RouterContext from 'react-router/lib/RouterContext';
import match from 'react-router/lib/match';
import { Provider } from 'react-redux';
import {
	findComponentsWithType,
	createFakeStore,
} from 'meetup-web-platform/lib/util/testUtils';
import {
	MOCK_APP_STATE,
} from 'meetup-web-mocks/lib/app';

import routes from './routes';

const FAKE_STORE = createFakeStore(MOCK_APP_STATE);

describe('base routes', () => {
	it('renders an Index page at `/`', function(done) {
		const location = '/';
		match({ location, routes }, (err, redirectLocation, renderProps) => {
			const app = TestUtils.renderIntoDocument(
				<Provider store={FAKE_STORE}>
					<RouterContext {...renderProps} />
				</Provider>
			);
			const indexComponent = findComponentsWithType(app, 'PageWrap');
			expect(indexComponent.length).toBe(1);
			done();
		});
	});
	it('renders the Error page at `/this/is/not/a/valid/route`', function(done) {
		const location = '/this/is/not/a/valid/route';
		match({ location, routes }, (err, redirectLocation, renderProps) => {
			const app = TestUtils.renderIntoDocument(
				<Provider store={FAKE_STORE}>
					<RouterContext {...renderProps} />
				</Provider>
			);
			const indexComponent = findComponentsWithType(app, 'Error404');
			expect(indexComponent.length).toBe(1);
			done();
		});
	});
});

