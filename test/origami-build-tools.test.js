/* eslint-env mocha, expect */
'use strict';

const expect = require('expect.js');
const mockery = require('mockery');
const sinon = require('sinon');

describe('obt', function() {

	const moduleUnderTest = '../lib/origami-build-tools';

	const version = process.version;
	const updateNotifierMock = sinon.stub();
	const logMock = sinon.stub();

	beforeEach(function() {
		logMock.resetHistory();
		updateNotifierMock.resetHistory();

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerMock('./helpers/log', logMock);

		mockery.registerAllowable(moduleUnderTest);

		mockery.resetCache();
	});

	after(() => {
		mockery.resetCache();
		mockery.deregisterAll();
		mockery.disable();
		process.version = version;
	});
});
