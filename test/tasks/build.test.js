/* global describe, it, before, after, afterEach */
'use strict';

const denodeify = require('denodeify');
const exec = denodeify(require('child_process').exec, function(err, stdout) { return [err, stdout]; });

const proclaim = require('proclaim');
const gulp = require('gulp');

const fs = require('fs-extra');
const path = require('path');

const build = require('../../lib/tasks/build');

const obtPath = process.cwd();
const oTestPath = 'test/fixtures/o-test';

const CORE_JS_IDENTIFIER = '__core-js_shared__';

describe('Build task', function() {
	describe('Build Js', function() {
		const pathSuffix = '-build-js';
		const buildTestPath = path.resolve(obtPath, oTestPath + pathSuffix);

		before(function() {
			fs.copySync(path.resolve(obtPath, oTestPath), buildTestPath);
			process.chdir(buildTestPath);
			fs.writeFileSync('bower.json', JSON.stringify(
				{
					name: 'o-test',
					main: 'main.js'
				}
			), 'utf8');
		});

		after(function() {
			process.chdir(obtPath);
			fs.removeSync(buildTestPath);
		});

		afterEach(function() {
			return fs.emptydirSync('build', function(){
				fs.removeSync('build');
			});
		});

		it('should work with default options', function(done) {
			build.js(gulp)
				.on('end', function() {
					const builtJs = fs.readFileSync('build/main.js', 'utf8');
					proclaim.include(builtJs, 'sourceMappingURL');
					proclaim.include(builtJs, 'var Test');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					proclaim.include(builtJs, 'var textTest = "This is a test\\n";');
					proclaim.include(builtJs, '\n\nmodule.exports = {"test":true}\n\n');
					done();
				});
		});

		it('should work with production option', function(done) {
			build
				.js(gulp, {
					env: 'production'
				})
				.on('end', function() {
					const builtJs = fs.readFileSync('build/main.js', 'utf8');
					proclaim.doesNotInclude(builtJs, 'sourceMappingURL');
					proclaim.doesNotInclude(builtJs, 'var Test');
					proclaim.doesNotInclude(builtJs, 'function Test() {\n\tvar name = \'test\';');
					proclaim.doesNotInclude(builtJs, '"This is a test"');
					proclaim.doesNotInclude(builtJs, 'function Test() {\n\tvar name = \'test\';');
					done();
			});
		});

		it('should include the the babel-runtime polyfills by default', function(done) {
			build
				.js(gulp, {
					js: './src/js/babelRuntime.js'
				})
				.on('end', function() {
					const builtJs = fs.readFileSync('build/main.js', 'utf8');
					proclaim.include(builtJs, CORE_JS_IDENTIFIER);
					done();
				});
		});

		it('should not include the the babel-runtime polyfills if \'babelRuntime\' is falsey', function(done) {
			build
				.js(gulp, {
					js: './src/js/babelRuntime.js',
					babelRuntime: false
				})
				.on('end', function() {
					const builtJs = fs.readFileSync('build/main.js', 'utf8');
					proclaim.doesNotInclude(builtJs, CORE_JS_IDENTIFIER);
					done();
				});
		});

		it('should build from custom source', function(done) {
			build
				.js(gulp, {
					js: './src/js/test.js'
				})
				.on('end', function() {
					const builtJs = fs.readFileSync('build/main.js', 'utf8');
					proclaim.include(builtJs, 'sourceMappingURL');
					proclaim.doesNotInclude(builtJs, 'var Test');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					done();
				});
		});

		it('should build to a custom directory', function(done) {
			build
				.js(gulp, {
					buildFolder: 'test-build'
				})
				.on('end', function() {
					const builtJs = fs.readFileSync('test-build/main.js', 'utf8');
					proclaim.include(builtJs, 'sourceMappingURL');
					proclaim.include(builtJs, 'var Test');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					proclaim.include(builtJs, 'var textTest = "This is a test\\n";');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					done();
				});
		});

		it('should build to a custom file', function(done) {
			build
				.js(gulp, {
					buildJs: 'bundle.js'
				})
				.on('end', function() {
					const builtJs = fs.readFileSync('build/bundle.js', 'utf8');
					proclaim.include(builtJs, 'sourceMappingURL');
					proclaim.include(builtJs, 'var Test');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					proclaim.include(builtJs, 'var textTest = "This is a test\\n";');
					proclaim.include(builtJs, 'function Test() {\n\tvar name = \'test\';');
					done();
				});
		});

		it('should fail on syntax error', function(done) {
			build
				.js(gulp, {
					js: './src/js/syntax-error.js'
				})
				.on('error', function(e) {
					proclaim.include(e.message, 'SyntaxError');
					proclaim.include(e.message, 'Unexpected token');
					done();
				})
				.on('end', function() {
					// Fail quickly to not wait for test to timeout
					proclaim.isFalse(true);
					done();
				});
		});

		it('should fail when a dependency is not found', function(done) {
			build
				.js(gulp, {
					js: './src/js/missing-dep.js'
				})
				.on('error', function(e) {
					try {
						proclaim.include(e.message, 'Module not found: Error: Can\'t resolve \'dep\'');
						done();
					} catch (error) {}
				})
				.on('end', function() {
					// Fail quickly to not wait for test to timeout
					proclaim.isFalse(true);
					done();
				});
		});
	});

	describe('Build Sass', function() {
		const pathSuffix = '-build-sass';
		const buildTestPath = path.resolve(obtPath, oTestPath + pathSuffix);

		before(function() {
			fs.copySync(path.resolve(obtPath, oTestPath), buildTestPath);
			process.chdir(buildTestPath);
			fs.writeFileSync('bower.json', JSON.stringify(
				{
					name: 'o-test',
					main: 'main.scss'
				}
			), 'utf8');
		});

		after(function() {
			process.chdir(obtPath);
			fs.removeSync(path.resolve(obtPath, buildTestPath));
		});

		afterEach(function() {
			return exec('rm -rf build');
		});

		it('should work with default options', function(done) {
			build.sass(gulp)
				.on('end', function() {
					const builtCss = fs.readFileSync('build/main.css', 'utf8');
					proclaim.include(builtCss, 'div {\n  color: blue; }\n');
					done();
				});
		});

		it('should work with production option', function(done) {
			build
				.sass(gulp, {
					env: 'production'
				})
				.on('end', function() {
					const builtCss = fs.readFileSync('build/main.css', 'utf8');
					proclaim.equal(builtCss, 'div{color:#00f}');
					done();
			});
		});

		it('should build from custom source', function(done) {
			build
				.sass(gulp, {
					sass: './src/scss/test.scss'
				})
				.on('end', function() {
					const builtCss = fs.readFileSync('build/main.css', 'utf8');
					proclaim.include(builtCss, 'p {\n  color: #000000; }\n');
					done();
				});
		});

		it('should build to a custom directory', function(done) {
			build
				.sass(gulp, {
					buildFolder: 'test-build'
				})
				.on('end', function() {
					const builtCss = fs.readFileSync('test-build/main.css', 'utf8');
					proclaim.include(builtCss, 'div {\n  color: blue; }\n');
					exec('rm -rf test-build')
						.then(function() { done(); }, done);
				});
		});

		it('should build to a custom file', function(done) {
			build
				.sass(gulp, {
					buildCss: 'bundle.css'
				})
				.on('end', function() {
					const builtCss = fs.readFileSync('build/bundle.css', 'utf8');
					proclaim.include(builtCss, 'div {\n  color: blue; }\n');
					done();
				});
		});
	});
});
