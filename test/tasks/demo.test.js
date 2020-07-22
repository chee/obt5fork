'use strict';

const fs = require('fs-extra');
const path = require('path');

const proclaim = require('proclaim');
const gulp = require('gulp');

const demo = require('../../lib/tasks/demo');

const projectPath = path.resolve(__dirname, '../../');
const oTestPath = 'test/fixtures/o-test';
const pathSuffix = '-demo';
const demoTestPath = path.resolve(projectPath, oTestPath + pathSuffix);

describe('Demo task', function() {
	let requiredOptions;

	beforeEach(function() {
		fs.copySync(path.resolve(projectPath, oTestPath), demoTestPath);
		process.chdir(demoTestPath);
		requiredOptions = {
			cwd: process.cwd()
		};
	});

	afterEach(function() {
		process.chdir(projectPath);
		fs.removeSync(demoTestPath);
	});

	describe('Build demos', function() {

		it('should error if a required option is not given', function (done) {
			try {
				demo(gulp, {});
			} catch (error) {
				for (const requiredOption of Object.keys(requiredOptions)) {
					proclaim.include(error.message, requiredOption);
				}
				done();
			}
			throw new Error('No error message about missing options given.');
		});

		it('should fail if there is not a config file', function(done) {
			fs.removeSync('./origami.json');
			fs.removeSync('./demos/src/config.json');
			demo(gulp, Object.assign({}, requiredOptions))
				.on('error', function(err) {
					proclaim.include(err.message, 'Couldn\'t find demos config path');
					done();
				});
		});

		it('should not error with a custom config file', function(done) {
			fs.writeFileSync('bower.json', '{"name":"o-test"}', 'utf8');
			fs.copySync('demos/src/config.json', 'demos/src/mysupercoolconfig.json');
			const demoStream = demo(gulp, Object.assign({}, requiredOptions, {
				demoConfig: 'demos/src/mysupercoolconfig.json'
			}))
			.on('error', function errorHandler(err) {
				// It will throw a template not found error which is fixed in "should build html" test
				proclaim.notEqual(err.message, 'Couldn\'t find demos config path, checked: demos/src/mysupercoolconfigs.json');
				demoStream.removeListener('error', errorHandler);
				done();
			});
		});

		it('should not fail using origami.json', function(done) {
			const demoStream = demo(gulp, Object.assign({}, requiredOptions, {
				demoConfig: 'origami.json'
			}))
			.on('error', function errorHandler(err) {
				// It will throw a template not found error which is fixed in "should build html" test
				proclaim.notEqual(err.message, 'Couldn\'t find demos config path, checked: origami.json');
				demoStream.removeListener('error', errorHandler);
				done();
			});
		});

		it('should not fail if there is a config.json file', function(done) {
			const demoStream = demo(gulp, Object.assign({}, requiredOptions))
				.on('error', function errorHandler(err) {
						// It will throw a template not found error which is fixed in "should build html" test
						proclaim.notEqual(err.message, 'Couldn\'t find demos config path, checked: demos/src/config.json,demos/src/config.js,origami.json');
						demoStream.removeListener('error', errorHandler);
						done();
					});
		});

		it('should not fail if there is a config.js file', function(done) {
			const config = fs.readFileSync('demos/src/config.json');
			fs.writeFileSync('demos/src/config.js', 'module.exports = ' + config, 'utf8');
			const demoStream = demo(gulp, Object.assign({}, requiredOptions))
				.on('error', function errorHandler(err) {
						// It will throw a template not found error which is fixed in "should build html" test
						proclaim.notEqual(err.message, 'Couldn\'t find demos config path, checked: demos/src/config.json,demos/src/config.js,origami.json');
						demoStream.removeListener('error', errorHandler);
						done();
					});
		});

		it('should not fail if it\'s using the old config format', function(done) {
			const demoStream = demo(gulp, Object.assign({}, requiredOptions, {
				demoConfig: 'demos/src/oldconfig.json'
			}))
			.on('error', function errorHandler(err) {
				proclaim.include(err.message, 'Demo template not found');
				demoStream.removeListener('error', errorHandler);
				done();
			});
		});

		it('should fail if there are demos with the same name', function(done) {
			const demoConfig = JSON.parse(fs.readFileSync('demos/src/config.json', 'utf8'));
			demoConfig.demos[1].name = 'test1';
			fs.writeFileSync('demos/src/config2.json', JSON.stringify(demoConfig));
			const demoStream = demo(gulp, Object.assign({}, requiredOptions, {
				demoConfig: 'demos/src/config2.json'
			}))
			.on('error', function errorHandler(err) {
				proclaim.equal(err.message, 'Demos with the same name were found. Give them unique names and try again.');
				demoStream.removeListener('error', errorHandler);
				done();
			});
		});

		it('should build demo html', function(done) {
			fs.writeFileSync('demos/src/test1.mustache', '<div>test1</div>', 'utf8');
			fs.writeFileSync('demos/src/test2.mustache', '<div>test2</div>', 'utf8');
			const demoStream = demo(gulp, Object.assign({}, requiredOptions))
			.on('end', function() {
					const test1 = fs.readFileSync('demos/test1.html', 'utf8');
					const test2 = fs.readFileSync('demos/test2.html', 'utf8');
					proclaim.include(test1, '<div>test1</div>');
					proclaim.include(test2, '<div>test2</div>');
					proclaim.match(test1, /\/v2\/polyfill\.min\.js\?features=.*promises/);
					proclaim.match(test2, /\/v2\/polyfill\.min\.js\?features=.*promises/);
					done();
				});

			demoStream.resume();
		});

		it('should load local partials', function(done) {
			fs.writeFileSync('demos/src/test1.mustache', '<div>test1</div>{{>partial1}}', 'utf8');
			fs.writeFileSync('demos/src/test2.mustache', '<div>test1</div>{{>partials/partial2}}', 'utf8');
			const demoStream = demo(gulp, Object.assign({}, requiredOptions))
			.on('end', function() {
				const test1 = fs.readFileSync('demos/test1.html', 'utf8');
				const test2 = fs.readFileSync('demos/test2.html', 'utf8');
				proclaim.include(test1, '<div>partial1</div>');
				proclaim.include(test2, '<div>partial2</div>');
				done();
			});

			demoStream.resume();
		});
	});
});
