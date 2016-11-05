import { makeServerRenderer } from 'meetup-web-platform';

// this variable must be injected by webpack using DefinePlugin
const browserAppFilename = WEBPACK_BROWSER_APP_FILENAME;  // eslint-disable-line no-undef
const assetHost = process.env.ASSET_SERVER_HOST || '0.0.0.0';
const assetPort = `:${process.env.ASSET_SERVER_PORT || 8001}`;
const assetPublicPath = `//${assetHost}${assetPort}${WEBPACK_ASSET_PUBLIC_PATH}`;  // eslint-disable-line no-undef

__webpack_public_path__ = assetPublicPath;  // eslint-disable-line no-undef
const routes = require('./app/routes').default;
const reducer = require('./app/reducer').default;

// the server-side `renderRequest$` Observable will take care of wrapping
// the react application with the full HTML response markup, including `<html>`,
// `<head>` and its contents, and the `<script>` tag required to load the app
// in the browser
const renderRequest$ = makeServerRenderer(routes, reducer, browserAppFilename, assetPublicPath);
export default renderRequest$;

