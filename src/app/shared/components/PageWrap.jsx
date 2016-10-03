import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';

import Button from './Button';

/*
 * -- Require base stylesheet --
 * (includes sassquatch2)
 *
 * Use 4 webpack loaders to build the css file and get the bundled filename
 * 1. sass-loader - parse Sass to CSS
 * 2. css-loader - parse CSS to re-write `@import` and `url(...)` to correct
 *    relative paths
 * 3. require-loader - 'run' the module written by css-loader to get the raw
 *    css string
 * 4. file-loader - write the css string to a file and return the filename for
 *    use in this script (name of input file + 7-digit hash + .css)
 */
const cssHref = require('file-loader?name=[name].[hash:7].css!require-loader!css!sass!../../../assets/scss/main.scss');

/**
 * @module PageWrap
 */
class PageWrap extends React.Component {
	render() {
		const {
			auth,
			onLogout,
			children,
		} = this.props;

		return (
			<div>
				<Helmet
					link={[
						{
							rel: 'stylesheet',
							type: 'text/css',
							href: cssHref
						}
					]}
				/>

				<ul>
					<li>
						{ auth.anonymous ?
							<Link to='/login/' className='text--small'>Login</Link> :
							<Button
								onClick={onLogout}>
								{`Logout ${self.name}`}
							</Button>
						}
					</li>
					<li>
						<Link to='/' className='text--small'>Home</Link>
					</li>
				</ul>

				<main id='mupMain' role='main'>
					<h1>Hello, world</h1>
					{children}
				</main>

			</div>
		);
	}
}

export default PageWrap;
