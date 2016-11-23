import React from 'react';

import { connect } from 'react-redux';

import PageWrap from '../shared/components/PageWrap';

import { SELF_REF } from './appQuery';

function mapStateToProps(state) {
	return {
		self: (state.app[SELF_REF] || {}).value || {},
	};
}

/**
 * @module AppContainer
 */
class AppContainer extends React.Component {
	render() {
		const {
			self,
			children,
		} = this.props;

		return (
			<PageWrap
				self={self}
			>

				{children}

			</PageWrap>
		);
	}
}

export default connect(mapStateToProps)(AppContainer);
