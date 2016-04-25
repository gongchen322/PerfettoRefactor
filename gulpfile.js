var gulp = require('gulp');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');

//To debug easily using web developer tools. 
var sourcemaps = require('gulp-sourcemaps');

//File Path
var DIST_PATH = './build';
var SCRIPTS_PATH = 'js/**/*.js';
var STYLE_PATH = 'assets/styles/**/*.css';
//Styles
gulp.task('styles', function () {
	console.log('Starting styles task');
	return gulp.src(STYLE_PATH)
		.pipe(plumber(function (err) {
			console.log('Styles Task Error: ');
			console.log(err);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(concat('styles.css'))
		.pipe(minifyCss())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(DIST_PATH))
		.pipe(livereload());
});

//Scripts
gulp.task('scripts', function() {
	console.log('Starting scripts task');

	return gulp.src(['index.js',SCRIPTS_PATH])
		.pipe(plumber(function(err) {
			console.log('Scripts Task Error: ');
			console.log(err);
			this.emit('end');	
		}))
		.pipe(sourcemaps.init())
		.pipe(concat('bundle.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(DIST_PATH))
		.pipe(livereload());
});

//Images
gulp.task('images', function() {
	console.log('Starting images task');
});


gulp.task('default', function() {
	console.log('Starting default task');
});

//

gulp.task('watch', function() {
	console.log('Starting watch task');
	livereload.listen();
	gulp.watch(SCRIPTS_PATH,['scripts']);
	gulp.watch(STYLE_PATH,['styles']);
});