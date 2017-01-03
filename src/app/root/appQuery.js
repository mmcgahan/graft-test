/**
 * Queries for the root-level route
 * @module appQuery
 */
export const SELF_REF = 'self';

/**
 * The viewer's member query needs to fetch info about the currently-logged in user on all pages
 *
 * @param {Object} renderProps a React Router renderProps including location, params, search params
 * @return {Object} an object describing mapping the `type` of data to the parameters for
 *   fetching that data
 */
export function selfQuery({ location, params }) {
	return {
		type: 'member',
		endpoint: '2/member/self',
		params: {},
		ref: SELF_REF,
	};
}

