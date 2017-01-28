import React from 'react';
import Helmet from 'react-helmet';

import getBrowserPolyfill from '../../../util/browserPolyfill';


/*
 * -- Require base stylesheets --
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
const baseCSSHref = require('file-loader?name=[name].[hash:7].css!require-loader!css-loader!sass-loader!../../../assets/scss/main.scss');
const webfontCSSHref = require('file-loader?name=[name].[hash:7].css!require-loader!css-loader!../../../assets/graphik.css');


/*
 * -- Inline SVG icon sprite --
 *
 * raw SVG sprite from `swarm-icons`
 */
const iconSpriteStyle = { display: 'none' };
const iconSprite = require('raw-loader!swarm-icons/dist/sprite/sprite.inc');


/**
 * @module PageWrap
 */
class PageWrap extends React.Component {
	/**
	 * This method ensures important app state props passed
	 * from `AppContainer` are passed to children (feature containers)
	 *
	 * @method renderChildren
	 * @returns {Array} Children with mapped props
	 */
	renderChildren() {
		const {
			self,
			localeCode,
			location
		} = this.props;

		return React.Children.map(
			this.props.children,
			(child, key) => React.cloneElement(child, { self, localeCode, location, key })
		);
	}

	/**
	 * @return {React.element} the page wrapping component
	 */
	render() {
		const { localeCode } = this.props;

		return (
			<div id='root'
				className='column'
				style={{ minHeight:'100vh' }}>
				<Helmet
					link={[
						{
							rel: 'stylesheet',
							type: 'text/css',
							href: webfontCSSHref
						},
						{
							rel: 'stylesheet',
							type: 'text/css',
							href: baseCSSHref
						},
					]}
					meta={[
						{
							name: 'viewport',
							content: 'width=device-width, initial-scale=1'
						}
					]}
					script={[
						getBrowserPolyfill(localeCode)
					]} />

				<div style={iconSpriteStyle} dangerouslySetInnerHTML={{__html: iconSprite}} />

				{this.renderChildren()}
			</div>
		);
	}
}

export default PageWrap;

