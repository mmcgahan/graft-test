import React from 'react';
import Helmet from 'react-helmet';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LoginForm from './LoginForm';
import { SELF_REF } from '../app/appQuery';

import {
	loginPost,
	logoutRequest
} from 'meetup-web-platform/lib/actions/authActionCreators';

const PAGE_TITLE = 'Login';

function mapStateToProps(state) {
	return {
		self: (state.app[SELF_REF] || {}).value || {},
		auth: state.auth || {}
	};
}

function mapDispatchToProps(dispatch) {
	// bind action creators so that they can be passed as event handlers
	return {
		handlers: bindActionCreators({
			loginPost,
			logoutRequest
		}, dispatch)
	};
}

/**
 * @class Login
 */
export class Login extends React.Component {
	render() {
		const {
			self,
			auth,
			handlers,
		} = this.props;

		return(
			<div>
				<Helmet
					title={PAGE_TITLE}
				/>

				<div className='bounds align--center'>
					<h1 className='text--display1'>{ auth.anonymous ? 'Log in' : 'Log out' }</h1>
					{ auth.anonymous ?
						<LoginForm
							errors={auth.errors}
							loginAction={handlers.loginPost}
						/> :
						<button
							onClick={handlers.logoutRequest}>
							{`Logout ${self.name}`}
						</button>
					}
				</div>
			</div>
		);
	}
}

Login.propTypes = {
	handlers: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
