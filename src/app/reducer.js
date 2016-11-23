/**
 * The root level reducer for the app.
 * @module reducer
 **/

import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

// Assemble reducers from all features here
import { SELF_REF } from './root/appQuery';

/**
 * app state should always have a member object - by default, it will be an
 * anonymous 'prereg' member. API will fill in details when it can.
 * @const
 */
export const DEFAULT_APP_STATE = {
	[SELF_REF]: {
		type: 'member',
		value: {
			status: 'prereg',
		}
	}
};

export const DEFAULT_AUTH_STATE = {};

/**
 * The primary reducer for the app-specific branch of state. It updates the
 * `state.app` sub-tree
 *
 * @param {Object} state
 * @param {ReduxAction} action
 * @return {Object}
 */
export function app(state=DEFAULT_APP_STATE, action={}) {
	let newState;
	console.log(action);
	switch (action.type) {
	case 'CACHE_SUCCESS':  // fall through - same effect as API success
	case 'API_SUCCESS':
			// API_SUCCESS contains an array of responses, but we just need to build a single
			// object to update state with
		newState = Object.assign.apply(Object, [{}].concat(action.payload.responses));
		return { ...state, ...newState };
	case 'LOGIN_ERROR':
		newState = {
			[SELF_REF]: {
				type: 'member',
				value: {
					errors: [ ...action.payload ],
				},
			}
		};
		return { ...state, ...newState };
	case 'LOGOUT_REQUEST':
		// need to clear ALL private data, i.e. all data
		return DEFAULT_APP_STATE;
	default:
		return state;
	}
}

export function config(state={}, action) {
	let apiUrl, csrf;

	switch(action.type) {
	case 'API_SUCCESS':
		csrf = action.meta.csrf;
		return { ...state, csrf };
	case 'CONFIGURE_API_URL':
		apiUrl = action.payload;
		return { ...state, apiUrl };
	default:
		return state;
	}
}

/**
 * This reducer manages a list of boolean flags that indicate the 'ready to
 * render' state of the application. It is used exclusively by the server,
 * which triggers actions when initializing a response that should eventually
 * make all flags 'true'
 *
 * The server can then read these flags from state and render when ready
 */
export function preRenderChecklist([apiDataLoaded] = [false], action) {
	return [
		apiDataLoaded || Boolean(['API_COMPLETE', 'API_ERROR'].find(type => type === action.type)),
	];
}

const routing = routerReducer;

const reducer = combineReducers({
	app,
	config,
	preRenderChecklist,
	routing
});

/** A reducer that combines all other feature reducers to construct the global state **/
export default reducer;
