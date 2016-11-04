import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logoutRequest } from 'meetup-web-platform/lib/actions/authActionCreators';

import PageWrap from '../shared/components/PageWrap';

function mapStateToProps(state) {
	return {
		auth: state.auth,
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
			children,
		} = this.props;

		return (
			<PageWrap
				onLogout={onLogout}
				auth={auth}>

				{children}

			</PageWrap>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
