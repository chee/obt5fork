'use strict';

const fs = require('fs-extra');
const path = require('path');
const proclaim = require('proclaim');

const files = require('../../lib/helpers/files');

const projectPath = path.resolve(__dirname, '../../');
const oTestPath = 'test/fixtures/o-test';
const pathSuffix = '-file';
const filesTestPath = path.resolve(projectPath, oTestPath + pathSuffix);

describe('Files helper', function() {
	before(function() {
		fs.copySync(path.resolve(projectPath, oTestPath), filesTestPath);
		process.chdir(filesTestPath);
	});

	after(function() {
		process.chdir(projectPath);
		fs.removeSync(filesTestPath);
	});

	it('should return module name', function() {
		fs.writeFileSync('bower.json', JSON.stringify({ name: 'o-test' }), 'utf8');
		proclaim.equal(files.getModuleName(filesTestPath), 'o-test');
		fs.unlink(path.resolve(filesTestPath, 'bower.json'));
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
