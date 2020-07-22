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
			fs.removeSync('origami.json');
			fs.removeSync('demos/src/config.json');
			demo(gulp, Object.assign({}, requiredOptions))
				.on('error', function(err) {
					proclaim.include(err.message, 'Couldn\'t find demo config');
					done();
				})
				.on('end', function () {
					throw new Error('Did not error.');
				});
		});

		it('should not fail using origami.json', function(done) {
			fs.removeSync('demos/src/config.json');
			const demoStream = demo(gulp, Object.assign({}, requiredOptions))
				.on('error', function(err) {
					throw new Error('An unexpected error was thrown: ' + err.message);
				})
				.on('end', function () {
					done();
				});

			demoStream.resume();
		});

		it('should fail if there are demos with the same name', function(done) {
			const demoConfig = JSON.parse(fs.readFileSync('origami.json', 'utf8'));
			demoConfig.demos[1].name = 'test1';
			fs.writeFileSync('origami.json', JSON.stringify(demoConfig));
			const demoStream = demo(gulp, Object.assign({}, requiredOptions))
			.on('error', function errorHandler(err) {
				proclaim.equal(err.message, 'Demos with the same name were found. Give them unique names and try again.');
				demoStream.removeListener('error', errorHandler);
				done();
			})
			.on('end', function () {
				throw new Error('Did not error.');
			});
			demoStream.resume();
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
