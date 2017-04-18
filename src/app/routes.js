/**
 * The root level router for the app.
 * @module routes
 **/
import ChildWrapper from '../components/ChildWrapper';
import Error404 from '../components/errors/404';
import App from './root/AppContainer';
import { selfQuery } from './root/appQuery';

// Assemble all feature routes here
import loginRoute from './login/loginRoute';

const routes = [
	{
		component: App,
		query: selfQuery,
		indexRoute: {
			component: ChildWrapper,
		},
		routes: [
			loginRoute,
			{
				component: Error404,
			},
		],
	},
];

export default routes;

