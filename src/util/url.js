/**
 * Tools for urls
 * @module Url
 */

/**
 * create url for static asset
 *
 * Currently this uses Webpack's `require` syntax to generate a URL to the built
 * static file (including versioning, minification, etc)
 *
 * @param {string} path the absolute path from `src/assets/`, e.g. `svg/chevron-right.svg`
 * @return {string} full url
 */
export const assetUrl = path => require(`file!../src/assets/${path}`);

