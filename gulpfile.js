var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var webdriver = require('gulp-protractor').webdriver;
var webdriverUpdate = require('gulp-protractor').webdriver_update;
var fs = require('fs');
var path = require('path');
var hjson = require('hjson');
var httpServer = require('http-server');


gulp.task('webdriver', webdriver);
gulp.task('webdriver:update', webdriverUpdate);

gulp.task('server', $.serve({
    root: ['.tmp', 'node_modules'],
    port: 1234
  })
);

gulp.task('demoSingle:compile:angularjs', function() {
  return gulp.src('e2e/test_cases/*.hjson')
    .pipe($.foreach(function(stream, file){
        var hjsonFile = file;
        var hjsonBasename = path.basename(hjsonFile.path, path.extname(hjsonFile.path));

        return gulp.src('e2e/templates/angularjs/single.html')
          .pipe($.rename(function(htmlFile) {
            htmlFile.basename = hjsonBasename;
          }))
          .pipe($.data(function() {
            return {data: hjson.parse(fs.readFileSync(hjsonFile.path, 'utf8'))};
          }))
          .pipe($.template({name: hjsonBasename}))
          .pipe(gulp.dest('.tmp/test/e2e'))
      })
    )
});


// Default task running `gulp`
gulp.task('default', ['build']);

console.log(httpServer);
