export default (name) => {
	const nameLcase = name.replace(/^[A-Z]/, (firstLetter) => firstLetter.toLowerCase());
	const actionCreatorsModule = `${nameLcase}ActionCreators`;
	return `
/**
 * Actions for the ${name} context
 * @module ${actionCreatorsModule}
 */

/**
 * @param {Object}
 */
export default function exampleAction(payload) {
	return {
		type: 'EXAMPLE_ACTION',
		payload,
	};
}
`;
};
