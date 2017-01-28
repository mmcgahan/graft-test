import appReducers from './reducer';

describe('reducer', () => {
	it('returns an object', () => {
		expect(appReducers).toEqual(jasmine.any(Object));
	});
});
