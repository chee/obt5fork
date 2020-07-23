'use strict';

const fs = require('fs-extra');
const path = require('path');
const proclaim = require('proclaim');

const files = require('../../lib/helpers/files');

const obtPath = path.resolve(__dirname, '../../');
const oTestPath = 'test/fixtures/o-test';
const pathSuffix = '-file';
const filesTestPath = path.resolve(obtPath, oTestPath + pathSuffix);

describe('Files helper', function() {
	beforeEach(function() {
		fs.copySync(path.resolve(obtPath, oTestPath), filesTestPath);
		process.chdir(filesTestPath);
	});

	afterEach(function() {
		process.chdir(obtPath);
		fs.removeSync(filesTestPath);
	});

	it('should return an empty string give no bower.json', function () {
		proclaim.equal(files.getModuleName(filesTestPath), '');
	});

	it('should return module name given a bower.json with a name property', function() {
		fs.writeFileSync('bower.json', JSON.stringify({ name: 'o-test' }), 'utf8');
		proclaim.equal(files.getModuleName(filesTestPath), 'o-test');
	});

	describe('.getMustacheFilesList(basePath)', () => {
		const mustacheTestPath = path.resolve(filesTestPath, 'demos/src');
		const flatMustacheFiles = path.resolve(mustacheTestPath, 'flat');
		const nestedMustacheFiles = path.resolve(mustacheTestPath, 'nested');

		it('is a function', () => {
			proclaim.isTypeOf(files.getMustacheFilesList, 'function');
		});

		it('returns an array', () => {
			const mustacheFiles = files.getMustacheFilesList(flatMustacheFiles);
			proclaim.isArray(mustacheFiles);
		});

		describe('when the directory structure is one level deep', () => {

			it('returns an array of all of the mustache files in the directory', () => {
				const mustacheFiles = files.getMustacheFilesList(flatMustacheFiles);
				proclaim.deepEqual(mustacheFiles, [
					path.join(flatMustacheFiles, 'example-1.mustache'),
					path.join(flatMustacheFiles, 'example-2.mustache')
				]);
			});

		});

		describe('when the directory structure has subdirectories', () => {

			it('returns an array of all of the mustache files in the directory and all subdirectories', () => {
				const mustacheFiles = files.getMustacheFilesList(nestedMustacheFiles);
				proclaim.deepEqual(mustacheFiles, [
					path.join(nestedMustacheFiles, 'example-1.mustache'),
					path.join(nestedMustacheFiles, 'example-2.mustache'),
					path.join(nestedMustacheFiles, 'folder-1/example-3.mustache'),
					path.join(nestedMustacheFiles, 'folder-1/folder-2/example-4.mustache')
				]);
			});

		});

	});

});
