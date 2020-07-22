# obtv5fork

`obtv5fork` will be used to bundle Origami components within v2 of the [Origami Build Service](https://github.com/Financial-Times/origami-build-service). It is a fork of [origami-build-tools v5](https://github.com/Financial-Times/origami-build-tools), which the [Origami Build Service](https://github.com/Financial-Times/origami-build-service) currently uses, with features for local component development removed.

## Requirements

`obtv5fork` requires [Node.js] 8.x and [npm].

## Build Assets

Build CSS and JavaScript bundles (typically, from `main.js` and `main.css`).

### JavaScript

```js
const gulp = require('gulp');
const obt = require('origami-build-tools');
const buildStream = obt.build.js(gulp, config);
```

JavaScript `config` accepts:
- js: `String` Path to your main JavaScript file. (Default: './main.js' and checks your bower.json to see if it's in its main key)
- buildJs: `String` Name of the built JavaScript bundle. (Default: 'main.js')
- buildFolder: `String` Path to directory where the built file will be created. If set to `'disabled'`, files won't be saved. (Default: './build/')
- env: `String` It can be either 'production' or 'development'. If it's 'production', it will run [uglify](https://github.com/mishoo/UglifyJS2). If it's 'development', it will generate a sourcemap. (Default: 'development')
- cwd: `String` The path to the working directory, in which the code to be built exists. (Default: current working directory)
- sourcemaps: `Boolean | 'inline'` Set to true to output sourcemaps as a separate file, even if env is 'production'. Set to 'inline' to output sourcemaps inline (Default: false in production, true in development)
- babelRuntime: `Boolean` Setting to false will exclude Babel polyfills from the built file. (Default: true)

### Sass

```js
const gulp = require('gulp');
const obt = require('origami-build-tools');
const buildStream = obt.build.sass(gulp, config);
```

Sass `config` accepts:
- sass: `String` Path to your main Sass file. (Default: './main.scss' and checks your bower.json to see if it's in its main key)
- autoprefixerCascade: `Boolean` Whether autoprefixer should display CSS prefixed properties [cascaded](https://github.com/postcss/autoprefixer#visual-cascade) (Default: false)
- autoprefixerRemove: `Boolean` Remove unneeded prefixes (Default: true)
- cwd: `String` The path to the working directory, in which the code to be built exists. (Default: current working directory)
- buildCss: `String` Name of the built CSS bundle. (Default: 'main.css')
- buildFolder: `String` Path to directory where the built file will be created. If set to `'disabled'`, files won't be saved. (Default: './build/')
- sourcemaps: `Boolean | 'inline'` Set to true to output sourcemaps as a separate file, even if env is 'production'. Set to 'inline' to output sourcemaps inline (Default: false in production, true in development)
- env: `String` It can be either 'production' or 'development'. If it's 'production', it will compile the Sass file with the 'compressed' style option and will also run [clean-css](https://github.com/jakubpawlowicz/clean-css). (Default: 'development')

### Demo Makup

Build demo markup found in the [origami.json manifest](https://origami.ft.com/spec/v1/manifest/).

```js
const gulp = require('gulp');
const obt = require('origami-build-tools');
const buildStream = obt.demo(gulp, config);
```

Demo `config` accepts:

- dist: `Boolean` Builds demo HTML for the build service. Default: `false`
- demoFilter: `Array` List of files for OBT to build. If the array is empty or `undefined`, it will build all demos. This is something only used in the [build service](https://origami-build.ft.com). Default: `undefined`
- cwd: `String` The path to the working directory, in which the code to be built exists. (Default: current working directory)

## Licence
This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).

[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
