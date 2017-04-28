import React from 'react';
import Helmet from 'react-helmet';
import LoginForm from 'meetup-web-components/lib/LoginForm';
import LogoutLink from 'meetup-web-platform/lib/components/LogoutLink';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { SELF_REF } from '../root/appQuery';

import {
	loginPost,
	logoutRequest,
} from 'meetup-web-platform/lib/actions/authActionCreators';

const PAGE_TITLE = 'Login';

function mapStateToProps(state) {
	return {
		self: (state.app[SELF_REF] || {}).value || {},
	};
}

function mapDispatchToProps(dispatch) {
	// bind action creators so that they can be passed as event handlers
	return {
		handlers: bindActionCreators(
			{
				loginPost,
				logoutRequest,
			},
			dispatch
		),
	};
}

/**
 * @class Login
 */
export class Login extends React.Component {
	/**
	 * @return {React.element} the app-wrapping component
	 */
	render() {
		const { self, handlers } = this.props;

		const isLoggedOut = self.status === 'prereg' || !self.name;
		return (
			<div>
				<Helmet>
					<title>{PAGE_TITLE}</title>
				</Helmet>

				<div className="bounds align--center">
					<h1 className="text--display1">
						{isLoggedOut ? 'Log in' : 'Log out'}
					</h1>
					{isLoggedOut
						? <LoginForm
								errors={self.errors}
								loginAction={handlers.loginPost}
							/>
						: <LogoutLink>
								{`Logout ${self.name}`}
							</LogoutLink>}
				</div>
			</div>
		);
	}
}

Login.propTypes = {
	handlers: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
