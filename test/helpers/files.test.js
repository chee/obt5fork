/* global describe, it, before, after, beforeEach, afterEach */
'use strict';

const expect = require('expect.js');

const fs = require('fs-extra');
const path = require('path');

const files = require('../../lib/helpers/files');

const obtPath = process.cwd();
const oTestPath = 'test/fixtures/o-test';
const pathSuffix = '-file';
const filesTestPath = path.resolve(obtPath, oTestPath + pathSuffix);

describe('Files helper', function() {
	before(function() {
		fs.copySync(path.resolve(obtPath, oTestPath), filesTestPath);
		process.chdir(filesTestPath);
	});

	after(function() {
		process.chdir(obtPath);
		fs.removeSync(filesTestPath);
	});

	it('should return module name', function() {
		expect(files.getModuleName()).to.be('');
		fs.writeFileSync('bower.json', JSON.stringify({ name: 'o-test' }), 'utf8');
		expect(files.getModuleName()).to.be('o-test');
		fs.unlink(path.resolve(filesTestPath, 'bower.json'));
	});

	describe('Main files', function() {
		before(function() {
			fs.writeFileSync('bower.json', JSON.stringify({ name: 'o-test' }), 'utf8');
		});

		after(function() {
			fs.unlink(path.resolve(filesTestPath, 'bower.json'));
		});

		it('should get the path of main.scss', function() {
			expect(files.getMainSassPath()).to.be(null);
			const bowerJson = require(path.join(process.cwd(), '/bower.json'));
			bowerJson.main = bowerJson.main || [];
			bowerJson.main.push('main.scss');
			fs.writeFileSync('bower.json', JSON.stringify(bowerJson), 'utf8');
			expect(files.getMainSassPath()).to.be(process.cwd() + '/main.scss');
		});

		it('should get the path of main.js', function() {
			expect(files.getMainJsPath()).to.be(null);
			const bowerJson = require(path.join(process.cwd(), '/bower.json'));
			bowerJson.main = bowerJson.main || [];
			bowerJson.main.push('main.js');
			fs.writeFileSync('bower.json', JSON.stringify(bowerJson), 'utf8');
			expect(files.getMainJsPath()).to.be(process.cwd() + '/main.js');
		});
	});

	describe('.getMustacheFilesList(basePath)', () => {
		const mustacheTestPath = path.resolve(filesTestPath, 'demos/src');
		const flatMustacheFiles = path.resolve(mustacheTestPath, 'flat');
		const nestedMustacheFiles = path.resolve(mustacheTestPath, 'nested');

		it('is a function', () => {
			expect(files.getMustacheFilesList).to.be.a('function');
		});

		it('returns an array', () => {
			const mustacheFiles = files.getMustacheFilesList(flatMustacheFiles);
			expect(mustacheFiles).to.be.an('array');
		});

		describe('when the directory structure is one level deep', () => {

			it('returns an array of all of the mustache files in the directory', () => {
				const mustacheFiles = files.getMustacheFilesList(flatMustacheFiles);
				expect(mustacheFiles).to.eql([
					path.join(flatMustacheFiles, 'example-1.mustache'),
					path.join(flatMustacheFiles, 'example-2.mustache')
				]);
			});

		});

		describe('when the directory structure has subdirectories', () => {

			it('returns an array of all of the mustache files in the directory and all subdirectories', () => {
				const mustacheFiles = files.getMustacheFilesList(nestedMustacheFiles);
				expect(mustacheFiles).to.eql([
					path.join(nestedMustacheFiles, 'example-1.mustache'),
					path.join(nestedMustacheFiles, 'example-2.mustache'),
					path.join(nestedMustacheFiles, 'folder-1/example-3.mustache'),
					path.join(nestedMustacheFiles, 'folder-1/folder-2/example-4.mustache')
				]);
			});

		});

	});

});
