import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logoutRequest } from 'meetup-web-platform/lib/actions/authActionCreators';

import PageWrap from '../shared/components/PageWrap';

import { SELF_REF } from './appQuery';

function mapStateToProps(state) {
	return {
		auth: state.auth,
		self: (state.app[SELF_REF] || {}).value || {},
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onLogout: bindActionCreators(logoutRequest, dispatch)
	};
}

/**
 * @module AppContainer
 */
class AppContainer extends React.Component {
	render() {
		const {
			onLogout,
			auth,
			self,
			children,
		} = this.props;

		return (
			<PageWrap
				onLogout={onLogout}
				auth={auth}
				self={self}
			>

				{children}

			</PageWrap>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
