export default (name) => {
	const nameLcase = name.replace(/^[A-Z]/, (firstLetter) => firstLetter.toLowerCase());
	const refName = `${name.toUpperCase()}_REF`;
	const containerName = `${name}Container`;

	return `
import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actionCreators from './${nameLcase}ActionCreators';

import {
	${refName},
} from './${nameLcase}Query';

const PAGE_TITLE = '${name} title';

function mapStateToProps(state) {
	return {
		${nameLcase}State: (state.app[${refName}] || {}).value || {},
	};
}

function mapDispatchToProps(dispatch) {
	// bind the action creators so that they can be passed as event handlers
	const handlers = bindActionCreators(actionCreators, dispatch);
	return {
		handlers
	};
}

/**
 * @class ${containerName}
 */
export class ${containerName} extends React.Component {
	render() {
		// Uncomment this block to use state, children, and other props
		/*
		const {
			${nameLcase}State,
			children
		} = this.props;
		*/

		return(
			<div>
				<Helmet>
					<title>{PAGE_TITLE}</title>
				</Helmet>
				<div className='bounds'>
					<h1>${name} Container</h1>
				</div>
			</div>
		);
	}
}

${containerName}.propTypes = {
	handlers: React.PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(${containerName});
`;
};
