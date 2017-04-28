import React from 'react';

import { connect } from 'react-redux';

import { SELF_REF } from './appQuery';
import PageWrap from '../../components/PageWrap';

function mapStateToProps(state) {
	return {
		self: (state.app[SELF_REF] || {}).value || {},
	};
}

/**
 * @module AppContainer
 */
class AppContainer extends React.Component {
	/**
	 * @return {React.element} the app-wrapping component
	 */
	render() {
		const { self, children } = this.props;

		return (
			<PageWrap self={self}>
				{children}
			</PageWrap>
		);
	}
}

export default connect(mapStateToProps)(AppContainer);
