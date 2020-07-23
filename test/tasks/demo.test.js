'use strict';

const fs = require('fs-extra');
const path = require('path');

const proclaim = require('proclaim');
const gulp = require('gulp');

const demo = require('../../lib/tasks/demo');

const obtPath = process.cwd();
const oTestPath = 'test/fixtures/o-test';
const pathSuffix = '-demo';
const demoTestPath = path.resolve(obtPath, oTestPath + pathSuffix);

describe('Demo task', function() {

	beforeEach(function() {
		fs.copySync(path.resolve(obtPath, oTestPath), demoTestPath);
		process.chdir(demoTestPath);
	});

	afterEach(function() {
		process.chdir(obtPath);
		fs.removeSync(demoTestPath);
	});

	describe('Build demos', function() {
		it('should fail if there is not a config file', function(done) {
			process.chdir(obtPath);
			fs.writeFileSync('bower.json', '{"name":"o-test"}', 'utf8');
			demo(gulp)
				.on('error', function(err) {
					proclaim.equal(err.message, 'Couldn\'t find demos config path, checked: origami.json,demos/src/config.json');
					fs.unlink(path.resolve(obtPath, 'bower.json'));
					process.chdir(demoTestPath);
					done();
				});
		});

		it('should build demos defined in custom configuration files when specified', function (done) {
			// Define template and custom config file
			const testKey = 'custom-config';
			const templatePath = `demos/src/${testKey}.mustache`;
			const templateMarkup = `<div>${testKey}</div>`;
			const configPath = `demos/src/${testKey}.json`;
			const config = {
				options: {
					sass: 'demos/src/demo.scss',
					js: 'demos/src/demo.js',
					bodyClasses: testKey
				},
				demos: [
					{
						name: testKey,
						description: 'A test demo.',
						template: templatePath
					}
				]
			};
			// Write templates and config to the test directory
			fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
			fs.writeFileSync(templatePath, templateMarkup, 'utf8');
			// Assert the template defined in custom config is built without error.
			demo(gulp, { demoConfig: configPath })
				.on('data', function (file) {
					proclaim.include(file.path, `${testKey}.html`);
					proclaim.include(file.contents.toString('utf8'), templateMarkup);
					done();
				}).on('error', function errorHandler(err) {
					throw new Error('There was an error: ' + err.message);
				});
		});

		it('should build demos defined in origami.json', function(done) {
			const createdFiles = [];
			const demoStream = demo(gulp, {
				demoConfig: 'origami.json'
			}).on('data', function (file) {
				createdFiles.push({
					path: file.path,
					content: file.contents.toString('utf8'),
				});
			}).on('error', function(err) {
				throw new Error('There was an error: ' + err.message);
			}).on('end', function() {
				const test = createdFiles.find(f => f.path.includes('test.html')) || {};
				const pa11y = createdFiles.find(f => f.path.includes('pa11y.html')) || {};
				proclaim.include(test.content, '<div>test</div>');
				proclaim.include(pa11y.content, 'contrast');
				done();
			});
		});

		it('should build demos defined in origami.json using the old format', function(done) {
			const demoConfig = JSON.parse(fs.readFileSync('origami.json', 'utf8'));
			// In the old syntax demos are keys in an object, rather than within
			// an array.
			demoConfig.demos = {
				test: {
					description: 'First test',
					template: 'demos/src/test.mustache'
				}
			};
			// At some point `options` was used over `demosDefaults`.
			delete demoConfig.demosDefaults;
			demoConfig.options = {
				sass: "demos/src/demo.scss",
				js: "demos/src/demo.js",
				bodyClasses: "old-config-test"
			};
			fs.writeFileSync('origami.json', JSON.stringify(demoConfig));

			demo(gulp, {
				demoConfig: 'origami.json'
			}).on('data', function (file) {
				proclaim.include(file.path, 'test.html');
				proclaim.include(file.contents.toString('utf8'), '<div>test</div>');
				proclaim.include(file.contents.toString('utf8'), 'old-config-test');
				done();
			}).on('error', function errorHandler(err) {
				throw new Error('There was an error: ' + err.message);
			});
		});

		it('should build demos using the deprecated config.json file for demo configuration over origami.json if it exists', function (done) {
			// Define template and demos/src/config.json
			const testKey = 'demos-src-config-demo';
			const templatePath = `demos/src/${testKey}.mustache`;
			const templateMarkup = `<div>${testKey}</div>`;
			const configPath = `demos/src/config.json`;
			const config = {
				options: {
					sass: 'demos/src/demo.scss',
					js: 'demos/src/demo.js',
					bodyClasses: testKey
				},
				demos: [
					{
						name: testKey,
						description: 'A test demo.',
						template: templatePath
					}
				]
			};
			// Write templates and config to the test directory
			fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
			fs.writeFileSync(templatePath, templateMarkup, 'utf8');
			// Assert the template defined in config.json is built without error.
			demo(gulp)
				.on('data', function(file) {
					proclaim.include(file.path, `${testKey}.html`);
					proclaim.include(file.contents.toString('utf8'), templateMarkup);
					done();
				}).on('error', function errorHandler(err) {
					throw new Error('There was an error: ' + err.message);
				});
		});

		it('should fail if there are demos with the same name', function(done) {
			const demoConfig = JSON.parse(fs.readFileSync('origami.json', 'utf8'));
			const existingDemoConfig = demoConfig.demos[1];
			demoConfig.demos.push(Object.assign({}, existingDemoConfig));
			fs.writeFileSync('origami.json', JSON.stringify(demoConfig));
			const demoStream = demo(gulp)
				.on('error', function errorHandler(err) {
					proclaim.equal(err.message, 'Demos with the same name were found. Give them unique names and try again.');
					done();
				});
			demoStream.resume();
		});

		it('should build demo html', function(done) {
			const demoStream = demo(gulp)
			.on('end', function() {
					const test = fs.readFileSync('demos/test.html', 'utf8');
					const pa11y = fs.readFileSync('demos/pa11y.html', 'utf8');
					proclaim.include(test, '<div>test</div>');
					proclaim.include(pa11y, 'No contrast');
					proclaim.match(test, /\/v2\/polyfill\.min\.js\?features=.*promises/);
					proclaim.match(pa11y, /\/v2\/polyfill\.min\.js\?features=.*promises/);
					done();
				});

			demoStream.resume();
		});

		it('should load local partials', function(done) {
			fs.writeFileSync('demos/src/test.mustache', `
				<div>test</div>
				{{>partial1}}
				{{>partials/partial2}}
			`, 'utf8');
			const demoStream = demo(gulp)
			.on('end', function() {
				const test = fs.readFileSync('demos/test.html', 'utf8');
				proclaim.include(test, '<div>partial1</div>');
				proclaim.include(test, '<div>partial2</div>');
				done();
			});

			demoStream.resume();
		});
	});
});
