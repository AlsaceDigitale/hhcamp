'use strict';
// generated on 2014-08-19 using generator-gulp-webapp 0.1.0

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    return gulp.src('app/styles/*.css')
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});

gulp.task('html', ['styles', 'scripts', 'fileinclude'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src(['.tmp/*.html', 'app/404.html'])
        .pipe(require('gulp-debug')({verbose: true}))
        .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        //.pipe($.cache($.imagemin({
        //    optimizationLevel: 3,
        //    progressive: true,
        //    interlaced: true
        //})))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return $.bowerFiles()
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

gulp.task('extras', function () {
    return gulp.src(['app/*.*', '!app/*.html', 'CNAME'], { dot: true })
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'extras']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('fileinclude', function() {
    gulp.src(['app/index.html','app/health-data-day.html','app/future-of-health.html','app/health-pitch-challenge.html','app/health-hackathon.html'])
        .pipe(require('gulp-file-include')({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('./.tmp'));
});

gulp.task('connect', ['fileinclude'], function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('.tmp'))
        .use(connect.static('app'))
        .use(connect.directory('app'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('connect-dist', function() {
    var connect = require('connect');
    var app = connect()
        .use(connect.static('dist'))
        .use(connect.directory('dist'));

    require('http').createServer(app)
        .listen(8123)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:8123');
        });
});

gulp.task("open-dist", ['connect-dist'], function(){
  var options = {
    url: "http://localhost:8123"
  };
  gulp.src("dist/index.html")
    .pipe(require('opn')("", options));
});

gulp.task('serve', ['connect'], function () {
    require('opn')('http://localhost:9000', {app: 'Chrome Canary'});
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

    gulp.watch([
        'app/*.html',
        '.tmp/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]).on('change', function (file) {
        gulp.run('fileinclude');
        server.changed(file.path);
    });

    gulp.watch('app/styles/**/*.css', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('deploy', function () {
  gulp.src("./dist/**/*")
    .pipe(require("gulp-gh-pages")({
      remoteUrl: 'git@github.com:alsacedigitale/hhcamp.git'
    }));
});
