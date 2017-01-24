export default (config) => {
	const {
		name,
		route,
	} = config;

	const instanceName = name.replace(/^[A-Z]/, (firstLetter) => firstLetter.toLowerCase());

	return `import TestUtils from 'react-addons-test-utils';
import {
	routeRenderer,
} from 'meetup-web-mocks/lib/testUtils';
import routes from './${instanceName}Routes';

describe('${name}Container', function() {
	it('renders an h1 element', function() {
		const renderLocation = routeRenderer(routes);
		return renderLocation('/${route}')
			.then(app => {
				const h1Element = TestUtils.findRenderedDOMComponentWithTag(app, 'h1');
				expect(h1Element).not.toBeNull();
			});
	});
});
`;
};

