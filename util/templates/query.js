export default (config) => {
	const {
		name,
		ref,
	} = config;
	const nameLcase = name.replace(/^[A-Z]/, (firstLetter) => firstLetter.toLowerCase());
	const queryModule = `${nameLcase}Query`;
	const refName = `${name.toUpperCase()}_REF`;
	return `
export const ${refName} = '${ref}';

/**
 * <Explain how the location + params are used in the query>
 *
 * @param {Object} renderProps a React Router renderProps including location, params, query string values
 * @return {Object} an object describing the data needed for the current location
 * @module ${queryModule}
 */
export default function ${queryModule}({ location, params }) {
	// extract only the params you need here
	return {
		type: '<your type>',
		endpoint: '<your endpoint>',  // e.g. 'members/1234' - no leading slash
		// params: <your params>,
		ref: ${refName},
	};
}
`;
};

