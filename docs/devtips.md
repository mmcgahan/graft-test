# Development tips

## Recommended Dev Tools

- Node Version Manager - https://github.com/creationix/nvm
- React Developer Tools (browser plugin) - https://github.com/facebook/react-devtools
- Redux Dev Tools ([Chrome browser
  extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd))
- ES6 + JSX syntax highlighting/linting plugin for your editor
	- vim
		- [pangloss/vim-javascript](https://github.com/pangloss/vim-javascript) + [mxw/vim-jsx](https://github.com/mxw/vim-jsx)
	- Sublime Text
		- [babel-sublime](https://github.com/babel/babel-sublime)
- An ESLint-aware editor plugin
	- vim
		- [syntastic](https://github.com/scrooloose/syntastic) + [eslint_d](https://github.com/mantoni/eslint_d.js) for vim
			- Install eslint_d: `npm install -g eslint_d`
			- Configure vim plugins, e.g. with Vundle:
			```vim
			Plugin 'scrooloose/syntastic'
			" ...
			let g:syntastic_javascript_checkers = ['eslint']
			let g:syntastic_javascript_eslint_exec = 'eslint_d'
			```
		- Fix lint problems with custom command `L`
		```vim
		command L execute('silent !eslint_d --fix %')
		\ | execute 'e|redraw!'
		```

## Yarn & package.json Dependencies

- Available [yarn commands](https://yarnpkg.com/en/docs/cli/)
- Anytime you update `package.json` and run `yarn install`,
yarn will automatically generate/update a `yarn.lock` file. When you run
`yarn install`, all the versions of dependencies specified in the lock
file are the ones installed.


## Testing

Tests can be written inside feature directories alongside their source
files, just make sure the test scripts end with `.test.js`. We use
[Jest](https://facebook.github.io/jest/) for testing, which is just a wrapper around
standard [Jasmine](http://jasmine.github.io/) tests.

Run `yarn run test` to run all tests

```sh
$ yarn run test
```

All tests will be run for every pull request opened on GitHub.

### UI Testing

Unit testing UI components is a little weird compared with unit testing
business logic.

1. You have to decide what aspects of a UI element are intrinsic to its
appearance rather than just implementation details
2. UI elements evolve based on aesthetic tastes as much as functional
requirements - inflexible tests require a lot of maintenance
3. Headless testing of browser-dependent objects requires some extra
tooling to simulate the target environment

#### Simulating interaction

[`TestUtils.Simulate`](https://facebook.github.io/react/docs/test-utils.html#simulate)
appears to work correctly for our testing setup - it should be used for
all tests that involve simulating events, like `onClick`. Check out
`button.test.js` for an example.

#### Verifying child elements

In UI testing, there is an almost invisible line between testing the
implementation (markup) and testing the behavior (appearance/content),
and ideally you only should test the _behavior_ - there are loads of
ways to change markup without changing the fundamental app experience,
and those kinds of markup changes should not be considered "bugs" that
result in failed tests.

The implication for constructing unit tests is that you should avoid
relying on the specific markup (tags and DOM structure). Sometimes it's
unavoidable, but if you are inclined to use `getElementsByTagName`,
`firstChild/lastChild`, or a `querySelector(All)` that includes a tag
name to access particular parts of the component UI, check whether there
is a better way to skip over the markup implementation details and grab
what you want explicitly.

A useful option is to add a PCV `className` to the element of interest,
and just use `youComponentEl.querySelector('.specificClassName')` to
find it. Classnames are free and DOM-independent, which means that no
matter what the markup is for your event name, you can always unit-test
the behavior (text content) accurately with

```js
// good
expect(eventNode.querySelector('.event-name').textContent).toEqual(testEventName);

// bad - assumes both tag (h5) and structure (first h5 in the card)
expect(eventNode.getElementsByTagName('h5')[0].textContent).toEqual(testEventName);
```

## Coverage reports (Coveralls)

Jest provides [code coverage](http://pjcj.net/testing_and_code_coverage/paper.html)
reports in a standard 'lcov' format that can be consumed by code coverage
services like [Coveralls.io](https://coveralls.io). The simplest way to use it
is to run the command

```sh
$ yarn run coverage
```

This will run `jest --coverage`, which runs the unit tests and prints an ASCII
table describing the test coverage in detail. As long as you have the
`COVERALLS_REPO_TOKEN` populated as an environment variable, the command will
also upload the results to our [Coveralls account](https://coveralls.io/github/meetup/mup-web),
which tracks our code coverage over time and integrates with the CI pipeline.

It's useful to look at the coverage report closely for the files that you have
used in your branch - you should be able to see whether your unit tests are
covering all the code paths that you have created. If there are holes, fill
them with more or better unit tests that activate the code as you intended.

We do not have a standard for what our overall coverage percentage should be,
but new code should not be allowed to significantly decrease coverage.

## Linting

To manually lint your code

```sh
$ yarn run lint
```

Whitespace issues will be fixed automatically - just remember to commit
the changes. Other style issues will log errors.

Our `.eslintrc` configuration is based on the 'recommended' preset, with
a number of additional rules that have been requested by the dev team. It's a
'living' standard, however, so please feel free to send PRs with updates!

