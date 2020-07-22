'use strict';

require('isomorphic-fetch');
const build = require('./tasks/build');
const demo = require('./tasks/demo');

const update = require('./helpers/update-notifier');
update();

module.exports = {
	'build': build,
	'demo': demo
};
