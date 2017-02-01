# Application source

This is the meat of your application, with application "entry points" for the
runnable app:

1. `app.js`: the root script that will run your application in the browser
2. `server-app.js`: the rendering script that will run on your app server

Both entry points must be bundled in order to be used on their respective
platforms (browser, NodeJS) - the build-related scripts in `scripts/` help make
this build routine easier to set up, including automatically-versioned browser app
bundles.

## File structure

```
├── src/
    ├── app/
         ├── <yourFeature>/
              ├── YourFeatureContainer.jsx
              ├── yourFeatureQuery.jsx
              ├── yourFeatureRoutes.jsx
         ├── root/
              ├── AppContainer.jsx
              ├── appQuery.jsx
         ├── shared/
              ├── components/
              ├── errors/
         ├── reducer.js
         ├── routes.js
    ├── assets/
    ├── sw/
    ├── util/
```

#### `app/`

Each high-level 'feature' will get its own directory here. In general,
features follow routes, so the `app/` directory will look similar
to the site map, e.g. `app/group/events/` will correspond to the
'events' feature accessible at `/:urlname/events/`. There are a few
conventions to follow when creating a feature:

1. The feature directory is the camelCase name of the feature. Keep it
	 simple and unique.
2. Most features will have at least one Container, which is a React
	 component that is connected to Redux state through `mapStateToProps`.
	 As with all components, the file and the exported class are
	 TitleCase.
3. Each feature can optionally assign one or more Query functions to its
	 Route as a `query` prop. The Query and the Route are the two other expected
	 modules in a feature directory. In general, they do not require unit tests
	 because they have a predictable structure and behavior that will be
	 tested during integration testing.

Using `yarn run generate` will provide you with a set of prompts that
automatically create templated feature files for you in this directory.

Two core features are already implemented in the `app` directory: `login` and `root`.

`root` provides the basic application shell - it loads 'global' data from the
API like the current member info and provides the i18n and routing context.
`login` is the standalone login page, which is all set up to provide logged-in
user state using Meetup.com credentials.

##### `app/shared/`

There are many modules that can be used across features - mainly React
components.

Some containers that are not route-specific (such as error pages and
generic markup wrappers) also live here.

- `components/`: High-level React components that are somewhere between
	widgets and features. For example, a location picker.

#### `util/`

Util modules are non-rendering modules that are also not strictly part
of the Redux data flow (e.g. action creators and reducers wouldn't be
utils). They are 'shared' functionality that doesn't belong in a single
existing module.

## Application structure

**Redux data flow**

![redux data flow](https://cloud.githubusercontent.com/assets/8643567/12990234/2db8a16a-d16e-11e5-9344-c94ca4c0461d.jpg)

1. **Routing** - starting at `src/app/routes.js`: The React Router definition
of all app routes
2. React components (generally grouped by feature)
3. Redux action creators (generally grouped by feature)
4. **Reducers** - starting at `src/app/reducer.js`:
  Defines the top level of the Redux state tree, with reducers for
  each branch
5. **Queries** - this is a unique Meetup addition to a Redux system, which is
intended to provide a declarative way for  _routes_ to describe what _data_
they need.
6. **Middleware** - side effect processing from Redux actions. The platform
provides a core set of Redux middleware modules for communication with the API
and caching.

## Routing

The React Router is used to match the current URL with a set of components to
render. It captures URL path segments and assigns them to variables if desired.
In general, all routes are nested, which means that the components assigned to
parent routes will _wrap_ the components assigned to child routes.

**Example**

1. `/` (Home)
2. `/:urlname/` - wrapper for _all group pages_ & group detail page
3. `/:urlname/events/` - event list & 'empty' event detail
4. `/:urlname/events/:id` - event detail

as pseudo-XML:

```xml
<Route path='/' ... >
    <!------ groupRoutes ------------------->
    <Route path=':urlname' ... >
        <!------ eventRoutes --------------->
        <Route path='events' ... >
            <Route path=':eventId' ... >
```

All the routes are nested, meaning that there is a constant application wrapper
(`src/app/shared/components/PageWrap.jsx`), which handles the "top nav" and
login/logout actions. The `/` route specifies the _query_ (see section below) that
handles getting data about the currently-logged in member (`state.app.self`).

## Reducers

`src/app/reducer.js` is not a large file but it defines the full structure of
the Redux state because it is the _base_ reducer used to create the Redux store
on the client (`src/browser-app-entry.js`) and the server (`src/server-app-entry.js`).

### State tree

```
├── routing (URL path + extracted params) - provided by React Router Redux
├── app (data from `query`s, used for rendering container components)
    ├── [ref] (arbitrary string key defined by a query)
        ├── type (string with type name, e.g. 'group', 'event', 'member')
        ├── value (array or object containing the data requested by the query)
├── config
```

# Queries

See the docs in
[meetup-web-platform](https://github.com/meetup/meetup-web-platform/blob/master/docs/Query.md)
for detailed info.

## Offline capability

In addition to the IndexedDB-based cache that provides instant data responses
even when the API connection fails during a browsing session, the mup-web platform
also uses a [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
to mediate network connections and serve cached static assets including the
HTML markup for the application shell and Javascript application source even
without a network connection. In combination, these two components provide a
complete offline-first application for any page the user has previously accessed.

### Service worker

The service worker is a client-side-only feature loaded from `src/sw.js`. When
installed, it downloads and caches all the major javascript files that might be
requested by the application, e.g. the core `client.js` script and the async
chunks generated by webpack. Currently the names for these chunks are hard-coded
in `sw.js`, but will likely need to be read from a generated webpack build
manifest in the future. The service worker also caches the application 'shell'
markup, which is immediately served when the user opens the site, regardless
of connectivity.

This configuration improves application behavior in a variety of situations
regardless of network connectivity.

1. First visit to site
	- application loads normally (no additional blocking download)
	- service worker starts caching assets in the background
2. Second visit to the site
	1. Good connectivity
		- service worker *instantly* loads application shell and app JS
		- _TODO network responds with 'fresh' assets/data_
		- _TODO service worker updates cached assets with fresh network response_
	2. No connectivity
		- service worker *instantly* loads application shell and app JS
		- _TODO UI notification to user indicating offline mode_
		- _TODO Smart reconnect requests (e.g. exponential back-off)
	3. Lie-fi (uncertain/inconsistent connectivity)
		- service worker *instantly* loads application shell and app JS
		- _TODO UI notification that API is not responding, waiting for data_

Read more about the [Service Worker lifecycle
here](https://developers.google.com/web/fundamentals/primers/service-worker/service-worker-lifecycle?hl=en).

For implementation details, check out the documentation in `src/sw.js`.

### TODO

- Offline-first tracking tools - how/what do we cache in an offline-capable way?
For intermittent connectivity, we can just use a request-scoped store, but for
"real" offline-first tracking, we would probably need an IndexedDB-based store
for tracking data that would eventually be sent to the server when a connection
is available

# i18n & l10n

## Terminology

For naming consistency in the code base:
 - *localeCode*: IANA language tags such as `en-US` or `en`
 - *locale*: Objects representing locale data, formatters, translations, etc.

When working with i18n vars, please be consistent with this terminology.

## FormatJS & React-Intl
[FormatJS](formatjs.io) is a modular collection of JavaScript libraries for internationalization
that are focused on formatting numbers, dates, and strings for displaying to people. It includes
a set of core libraries that build on the JavaScript Intl built-ins and industry-wide i18n standards,
plus a set of integrations for common template and component libraries.

[React-Intl](https://github.com/yahoo/react-intl/wiki) is part of FormatJS. It provides bindings
to React via its components and API -- i.e., to format dates, numbers, and strings, including
pluralization and handling translations.

[IntlProvider](https://github.com/yahoo/react-intl/wiki/Components#intlprovider) is a React-Intl
component used to set up the i18n context. It accepts a localeCode and an object of translated messages.

Refer to `src/components/PageWrap.jsx` for IntlProvider usage in mup-web.

## Determing app locale
Refer to `src/util/localizationUtils.js` for code on how we determine the app locale.

The localeCode provided to intlProvider is always the locale returned by the API -- for both
logged-in and anonymous members.


## TRN Extraction & Builds
TRN extraction and builds are handled by the `babel-plugin-react-intl` plugin. See
[`.babelrc`](../.babelrc) for plugin configuration.

Any TRN defined in JS will be extracted to `/build/trn/` directory, which is gitignored.
The files are component-level files

Language-specific JSON translation files currently live in `src/app/trns/` directory
These files are also component-level translated files.

## Creating TRNs
TRNs to be extracted and translated can be defined in one of two ways in Javascript.
In either approach, the trn will require an `id`, `defaultMessage`, and optionally
`values` or `description`.

- `id`: the trn key
- `defaultMessage`: english copy
- `values`: object key->value map for variable interpolation (if needed)
- `description`: context of message for use by translators. Though optional,
most messages should have a description.

1) Predefined Messages

Example:

```js
const trns = defineMessages({
	rsvp: {
		id: 'common.rsvp',
		defaultMessage: 'RSVP',
		description: 'Common translation for RSVP buttons and links'
	}
});
```

`defineMessages` is a hook exported by `react-intl` to use when extracting
trns defined in Javascript sources. See the react-intl docs for
[defineMessage()](https://github.com/yahoo/react-intl/wiki/API#definemessages)

2) Inline Messages

```js
<FormattedMessage
	id='event.eventNameHeader'
	defaultMessage='Event Detail: {eventName}'
	description='Header for event detail page'
	values={{eventName: event.name}}
/>
```

Provide at least the `id` and `defaultMessage` params to the react-intl
<FormattedMessage> tag.

*Note*: Don't use <FormattedPlurals> - it is only for single-language applications.

## How to create localized components

Each component is responsible for requiring it's own component-level translated messages
json file (see `src/app/trns/`), and passing it along to an `<IntlProvider>`.

(t.b.d. --- fill this out with examples once process finalized)

## Transifix process / flow

t.b.d -- fill in once process finalized.

