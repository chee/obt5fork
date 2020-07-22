'use strict';

require('isomorphic-fetch');
const build = require('./tasks/build');
const demo = require('./tasks/demo');

const metrics = require('./helpers/metrics');
const nodeVersion = process.version.slice(1).split('.')[0];
const data = {
	nodeVersion : {
		invoked: {}
	}
};
data.nodeVersion.invoked[nodeVersion] = 1;
metrics(data);

const update = require('./helpers/update-notifier');
update();

module.exports = {
	'build': build,
	'demo': demo
};
