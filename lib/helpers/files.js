'use strict';

const fs = require('fs');
const path = require('path');

function requireIfExists(filePath) {
	if (fs.existsSync(filePath)) {
		return require(filePath);
	} else {
		return undefined;
	}
}

function getBowerJson(cwd) {
	cwd = cwd || process.cwd();
	return requireIfExists(path.join(cwd, '/bower.json'));
}

function getModuleName(cwd) {
	const bowerJson = getBowerJson(cwd);
	if (bowerJson) {
		return bowerJson.name;
	}
	return '';
}

// List mustache files in a directory, recursing over subdirectories
function getMustacheFilesList(basePath) {
	let mustacheFiles = [];

	fs.readdirSync(basePath, {encoding: 'utf8'}).forEach(filePath => {
		filePath = path.join(basePath, filePath);
		const stat = fs.statSync(filePath);

		// If the current path points to a directory, recurse
		// over it
		if (stat.isDirectory()) {
			mustacheFiles = mustacheFiles.concat(getMustacheFilesList(filePath));

		// If the current path points to a mustache file, add
		// it to the output list
		} else if (path.extname(filePath) === '.mustache') {
			mustacheFiles.push(filePath);
		}
	});

	return mustacheFiles.sort();
}

exports.getModuleName = getModuleName;
exports.getMustacheFilesList = getMustacheFilesList;
