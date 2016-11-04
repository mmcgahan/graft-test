import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
	it('exists', () => {
		const loginForm = TestUtils.renderIntoDocument(<LoginForm loginAction={() => {}} />);
		const loginFormNode = ReactDOM.findDOMNode(loginForm);
		expect(loginFormNode).not.toBeNull();
	});

	it('calls loginAction with email and password values when submit button is clicked', () => {
		const spyable = {
			loginAction: () => {}
		};
		const EMAIL = 'a@b.com';
		const PASSWORD = '1234';

		spyOn(spyable, 'loginAction');
		const loginForm = TestUtils.renderIntoDocument(<LoginForm loginAction={spyable.loginAction} />);
		const loginFormEl = ReactDOM.findDOMNode(loginForm);
		const emailInput = loginFormEl.querySelector('.loginForm-email');
		const passwordInput = loginFormEl.querySelector('.loginForm-password');
		emailInput.value = EMAIL;
		TestUtils.Simulate.change(emailInput);
		passwordInput.value = PASSWORD;
		TestUtils.Simulate.change(passwordInput);

		TestUtils.Simulate.click(loginFormEl.querySelector('.loginForm-submit'));
		expect(spyable.loginAction).toHaveBeenCalledWith({ email: EMAIL, password: PASSWORD });
	});
});

