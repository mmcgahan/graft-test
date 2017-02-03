import Joi from 'joi';
import {
	directPolyfill,
	polyfillServiceUrl,
} from './browserPolyfill';

describe('directPolyfill', () => {
	it('returns a promise', () => {
		expect(directPolyfill()).toEqual(jasmine.any(Promise));
	});
	it('calls System.import when window.URLSearchParams is not defined', () => {
		expect(directPolyfill()).toEqual(jasmine.any(Promise));
	});
	it('does not call System.import when window.URLSearchParams is defined', () => {
		expect(directPolyfill()).toEqual(jasmine.any(Promise));
	});
});

describe('polyfillServiceUrl', () => {
	it('returns a url string', () => {
		const url = polyfillServiceUrl();
		expect(Joi.validate(url, Joi.string().uri()).error).toBeNull();
	});
});

