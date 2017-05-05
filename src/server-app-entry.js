import { makeServerRenderer } from 'meetup-web-platform';
import makeRootReducer from 'meetup-web-platform/lib/reducers/platform';
import envConfig from 'src/util/config';

// this variable must be injected by webpack using DefinePlugin
const browserAppFilename = WEBPACK_BROWSER_APP_FILENAME; // eslint-disable-line no-undef
const ASSET_SERVER_HOST = envConfig.asset_server.host;
const ASSET_SERVER_PORT = envConfig.asset_server.port;
const ASSET_PATH = envConfig.asset_path;
const assetPublicPath = `//${ASSET_SERVER_HOST}:${ASSET_SERVER_PORT}${ASSET_PATH}${WEBPACK_ASSET_PUBLIC_PATH}`; // eslint-disable-line no-undef

__webpack_public_path__ = assetPublicPath; // eslint-disable-line no-undef
const appReducers = require('./app/reducer').default;
const routes = require('./app/routes').default;
const reducer = makeRootReducer(appReducers);

// webpack will inject the base URL for this app bundle
const basename = WEBPACK_BASE_URL; // eslint-disable-line no-undef

// the server-side `renderRequest$` Observable will take care of wrapping
// the react application with the full HTML response markup, including `<html>`,
// `<head>` and its contents, and the `<script>` tag required to load the app
// in the browser
const renderRequest$ = makeServerRenderer(
	routes,
	reducer,
	browserAppFilename,
	assetPublicPath,
	[],
	basename
);
export default renderRequest$;
