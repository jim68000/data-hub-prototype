const gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('serve', (cb) => {
  var started = false;

	return nodemon({
    verbose: true,
    exec: 'node --debug',
		script: 'app.js',
    ignore: [ './app/javascripts', './build' ]
	}).on('start', function() {
		// to avoid nodemon being started multiple times
		if (!started) {
			cb();
			started = true;
		}
  });

});
