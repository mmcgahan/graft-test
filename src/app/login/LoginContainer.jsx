import React from 'react';
import Helmet from 'react-helmet';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Link } from 'react-router';

import LoginForm from './LoginForm';
import { SELF_REF } from '../root/appQuery';

import {
	loginPost,
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
		handlers: bindActionCreators({
			loginPost,
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
			handlers,
		} = this.props;

		const isLoggedOut = self.status === 'prereg';

		return(
			<div>
				<Helmet
					title={PAGE_TITLE}
				/>

				<div className='bounds align--center'>
					<h1 className='text--display1'>{ isLoggedOut ? 'Log in' : 'Log out' }</h1>
					{ isLoggedOut ?
						<LoginForm
							errors={self.errors}
							loginAction={handlers.loginPost}
						/> :
						<Link to='?logout'>
							{`Logout ${self.name}`}
						</Link>
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
