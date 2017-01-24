import gulp from 'gulp';
import gutil from 'gulp-util';
import source from 'vinyl-source-stream';
import babelify from 'babelify';
import watchify from 'watchify';
import exorcist from 'exorcist';
import browserify from 'browserify';
import browserSync from 'browser-sync';

// Watchify args contains necessary cache options to achieve fast incremental bundles.
// See watchify readme for details. Adding debug true for source-map generation.
watchify.args.debug = true;
// Input file.
let bundler = watchify(browserify('./app/js/app.js', watchify.args));

// Babel transform
bundler.transform(babelify.configure({
  sourceMapsAbsolute: true,
  presets: ['latest']
}));

// On updates recompile
bundler.on('update', bundle);

function bundle() {
  gutil.log('Compiling JS...');

  return bundler.bundle()
    .on('error', function (err) {
      gutil.log(err.message);
      browserSync.notify("Browserify Error!");
      this.emit("end");
    })
    .pipe(exorcist('app/js/dist/bundle.js.map'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./app/js/dist'))
    .pipe(browserSync.stream({once: true}));
}

/**
 * Gulp task javascript compilation
 */
gulp.task('js', function () {
  return bundle();
});


gulp.task('default', ['js'], () => {
  browserSync.init({
    server: "./app"
  });
});