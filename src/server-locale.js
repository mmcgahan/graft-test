import makeRenderer from 'meetup-web-platform/renderers/server-render';

// this variable must be injected by webpack using DefinePlugin
const clientFilename = WEBPACK_CLIENT_FILENAME;  // eslint-disable-line no-undef
const assetHost = process.env.ASSET_SERVER_HOST || '0.0.0.0';
const assetPort = process.env.ASSET_SERVER_PORT ? `:${process.env.ASSET_SERVER_PORT}` : '';
const assetPublicPath = `//${assetHost}${assetPort}${WEBPACK_ASSET_PUBLIC_PATH}`;  // eslint-disable-line no-undef

__webpack_public_path__ = assetPublicPath;  // eslint-disable-line no-undef
const routes = require('./app/routes').default;
const reducer = require('./app/reducer').default;

// the server-side `renderRequest$` Observable will take care of wrapping
// the react application with the full HTML response markup, including `<html>`,
// `<head>` and its contents, and the `<script>` tag required to load the app
// on the client
const renderRequest$ = makeRenderer(routes, reducer, clientFilename, assetPublicPath);
export default renderRequest$;

