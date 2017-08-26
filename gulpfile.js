'use strict'

var gulp = require('gulp');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var util = require('gulp-util');
var cached = require('gulp-cached');
var concat = require('gulp-concat');
var remember = require('gulp-remember');
var del = require('del');
var browserSync = require('browser-sync').create();

var DEST = 'dist/';
var DEST_ASSETS_JS = 'dist/js';

// var config = {
//     production: !!util.env.production
// };

gulp.task('clean', function() {
    return del('dist');
});

gulp.task('index', function() {
    return gulp.src('app/*.html')
        .pipe(gulp.dest(DEST));
});

gulp.task('scripts', function() {
    return gulp.src('app/js/**/*.js', {since: gulp.lastRun('scripts')})
        .pipe(uglify())
        .pipe(remember('scripts'))
        .pipe(concat('all.js'))
        .pipe(gulp.dest(DEST_ASSETS_JS));
});

gulp.task('styles', function() {
    return gulp.src('app/**/**.scss')
        .pipe(sass())
        .pipe(csso())
        .pipe(rename({extname: '.css'}))
        .pipe(gulp.dest(DEST))
});

gulp.task('img', function() {
    return gulp.src('app/images/**', {base: 'app'})
        .pipe(cached('img'))
        .pipe(imagemin())
        .pipe(remember('img'))
        .pipe(gulp.dest(DEST))
});

gulp.task('fonts', function() {
    return gulp.src('app/fonts/*.*', {base: 'app'})
        .pipe(cached('fonts'))
        .pipe(remember('fonts'))
        .pipe(gulp.dest(DEST))
});

var paths = {
    css:['app/css/*.scss'],
    script:['app/js/*.js'],
    img: ['app/images/**'],
    fonts: ['app/fonts/**'],
    html: ['app/*.html']
};

gulp.task('watch',function(){
    gulp.watch(paths.css, gulp.series('styles')).on('unlink', function(filepath) {
        remember.forget('styles', path.resolve(filepath));
        delete cached.caches.styles[path.resolve(filepath)];
    });

    gulp.watch(paths.script, gulp.series('scripts')).on('unlink', function(filepath) {
        remember.forget('scripts', path.resolve(filepath));
        delete cached.caches.scripts[path.resolve(filepath)];
    });

    gulp.watch(paths.fonts, gulp.series('fonts')).on('unlink', function(filepath) {
        remember.forget('fonts', path.resolve(filepath));
        delete cached.caches.fonts[path.resolve(filepath)];
    });
    gulp.watch(paths.img, gulp.series('img')).on('unlink', function(filepath) {
        remember.forget('img', path.resolve(filepath));
        delete cached.caches.img[path.resolve(filepath)];
    });

    gulp.watch(paths.html, gulp.series('index')).on('unlink', function(filepath) {
        remember.forget('html', path.resolve(filepath));
        delete cached.caches.html[path.resolve(filepath)];
    });
});

gulp.task('serve', function() {
    browserSync.init({
        server: 'dist'
    });
    browserSync.watch('dist/**/*.*').on('change', browserSync.reload);
});

gulp.task('build', gulp.series('clean', gulp.parallel('img', 'fonts', 'index', 'scripts', 'styles')));

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
