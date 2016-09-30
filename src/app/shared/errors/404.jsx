import React from 'react';
import { connect } from 'react-redux';

function mapStateToProps(state) {
	return { appState: state };
}

/**
 * Displays a 404 error page inside the application markup
 * @class Error404
 */
class Error404 extends React.Component {
	render() {
		return (
			<div>
				<h1>Oh nooooo!</h1>
				<p>There is no route defined for {this.props.location.pathname}</p>
			</div>
		);
	}
}

export default connect(mapStateToProps)(Error404);
