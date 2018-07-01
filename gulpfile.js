var gulp = require('gulp');
var sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();

// Set the banner content
var banner = ['/*!\n',
' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
' */\n',
''
].join('');

// Nodemon server task
gulp.task('start', () => {
  nodemon({
    script: 'index.js',
    watch: ["index.js"],
    ext: "js"
  })
});

// Configure the browserSync task
gulp.task('browserSync', ['css'] , function() {
  browserSync.init({
    proxy: "localhost:8080",
    injectChanges:true
  });
});

gulp.task('reload', function () {
  browserSync.reload()
})

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function() {

  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./docs/vendor/bootstrap'))

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./docs/vendor/jquery'))

  gulp.src([
    './node_modules/idb/lib/idb.js'
  ])
    .pipe(gulp.dest('./docs/vendor/idb'))
    
});
  
// Compile SCSS
gulp.task('css', function() {
  return gulp.src('./docs/scss/**/*.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./docs/css'))
  .pipe(browserSync.stream({ match: '**/*.css' }))
});

// Default task
gulp.task('default', ['css', 'vendor']);


// Watch task
gulp.task('watch', ['browserSync'], () => {
  gulp.watch('./docs/scss/**/{*.scss,_*.scss}', ['css','reload']);
  gulp.watch("./docs/*.html",['reload']);
  gulp.watch("./docs/es6/*.js",['reload']);
  gulp.watch("./docs/*.js", ['reload']);
});


// Dev task
gulp.task('dev', ['watch', 'start']);

// serve task
gulp.task('serve',['start'])
