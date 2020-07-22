'use strict';

const gulp = require('gulp');
const obt = require('./lib/origami-build-tools');

gulp.task('test', function() {
	return obt.test.npmTest(gulp);
});

gulp.task('install', function() {
	return obt.install();
});

gulp.task('watch', function() {
	gulp.watch('./lib/**/*', ['test']);
});

gulp.task('default', ['test', 'watch']);
