import {
	DEFAULT_AUTH_STATE,
	DEFAULT_APP_STATE,
	app,
	auth,
} from './reducer';

describe('reducer', () => {
	beforeEach(function() {
		this.MOCK_STATE = { foo: 'bar' };
	});
	it('returns default state for empty action', () => {
		expect(app(undefined, {})).toEqual(DEFAULT_APP_STATE);
		expect(auth(undefined, {})).toEqual(DEFAULT_AUTH_STATE);
	});
	it('auth should be cleared by a LOGOUT_REQUEST event', function() {
		expect(auth(this.MOCK_STATE, { type: 'LOGOUT_REQUEST' })).toEqual(DEFAULT_AUTH_STATE);
	});
	it('app data should be cleared by a LOGOUT_REQUEST event', function() {
		expect(app(this.MOCK_STATE, { type: 'LOGOUT_REQUEST' })).toEqual(DEFAULT_APP_STATE);
	});
});
