'use strict';

const fs = require('fs');
const path = require('path');

function getBuildFolderPath(cwd) {
	cwd = cwd || process.cwd();
	return path.join(cwd, '/build/');
}

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

function getMainSassPath(cwd) {
	cwd = cwd || process.cwd();
	const sassMainPath = path.join(cwd, '/main.scss');
	const bowerJson = getBowerJson(cwd);
	const fileExists = fs.existsSync(sassMainPath);
	let isInBowerMain = false;
	if (bowerJson) {
		if (bowerJson.main instanceof Array && bowerJson.main.indexOf('main.scss') > -1) {
			isInBowerMain = true;
		} else if (typeof bowerJson.main === 'string' && bowerJson.main === 'main.scss') {
			isInBowerMain = true;
		}
	}
	if (isInBowerMain && !fileExists) {
		console.log('main.scss is listed in bower.json main, but file doesn\'t exist.');
	} else if (!isInBowerMain && fileExists) {
		console.log('main.scss exists but is not listed in bower.json main.');
	}
	if (isInBowerMain && fileExists) {
		return sassMainPath;
	} else {
		return null;
	}
}

function getMainJsPath(cwd) {
	cwd = cwd || process.cwd();
	const jsMainPath = path.join(cwd, '/main.js');
	const bowerJson = getBowerJson(cwd);
	const fileExists = fs.existsSync(jsMainPath);
	let isInBowerMain = false;
	if (bowerJson) {
		if (bowerJson.main instanceof Array && bowerJson.main.indexOf('main.js') > -1) {
			isInBowerMain = true;
		} else if (typeof bowerJson.main === 'string' && bowerJson.main === 'main.js') {
			isInBowerMain = true;
		}
	}
	if (isInBowerMain && !fileExists) {
		console.log('main.js is listed in bower.json main, but file doesn\'t exist.');
	} else if (!isInBowerMain && fileExists) {
		console.log('main.js exists but is not listed in bower.json main.');
	}
	if (isInBowerMain && fileExists) {
		return jsMainPath;
	} else {
		return null;
	}
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

exports.getBuildFolderPath = getBuildFolderPath;
exports.getMainSassPath = getMainSassPath;
exports.getMainJsPath = getMainJsPath;
exports.getModuleName = getModuleName;
exports.getMustacheFilesList = getMustacheFilesList;
