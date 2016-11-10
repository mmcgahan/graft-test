/**
 * The root level router for the app.
 * @module routes
 **/
import Error404 from './shared/errors/404';
import App from './root/AppContainer';
import { selfQuery } from './root/appQuery';

// Assemble all feature routes here
import loginRoutes from './login/loginRoutes';

const routes = {
	path: '/',
	component: App,
	query: selfQuery,
	childRoutes: [
		loginRoutes,
		{
			path: '*',
			component: Error404,
			status: 404
		}
	],
};

export default routes;

