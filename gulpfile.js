
var pluginsDir = __dirname.replace(/\\/g, '/') + '/../node_modules/'

var projectFolder = 'default-modules'
var pathToDefaultModules = './../' + projectFolder + '/modules/'
var defaultModuleName = 'default'

function camelCaser(input) {
    return input.replace(/[- _](.)/g, function(match, group1) {
        return group1.toUpperCase()
    })
}

function loadPlugin(name) {
    if(require.resolve(name)) {
        // console.log(require.resolve(name));
        return require(name)
    }

    // console.log(require.resolve(pluginsDir + name));
    return require(pluginsDir + name)
}

var gulp = require('gulp'),
    fs = loadPlugin('fs'),
    argv = loadPlugin('yargs').argv,
    config = {
        paths: {
            defaultModule: pathToDefaultModules + defaultModuleName,
            defaultModuleLess: pathToDefaultModules + defaultModuleName + '/assets/less',
            defaultModuleSass: pathToDefaultModules + defaultModuleName + '/assets/scss',
            less: {
                srcAll:  'application/modules',
                main:    'application/modules/main/assets/less/main.less',
                mainDir: 'application/modules/main/assets/less',
            },
            js: {
                srcAll:  'application/modules',
                main:    'application/modules/main/assets/js/main.js',
                mainDir: 'application/modules/main/assets/js',
            }
        }
    },
    plugins = {
        cssmin:      loadPlugin('gulp-minify-css'),
        webpack:     loadPlugin('webpack-stream'),
        debug:       loadPlugin('gulp-debug'),
        gulpReplace: loadPlugin('gulp-replace'),
        less:        loadPlugin('gulp-less'),
        notify:      loadPlugin('gulp-notify'),
        rename:      loadPlugin('gulp-rename'),
        util:        loadPlugin('gulp-util')
    };


gulp.task('default', function() {
  return gulp.src(config.paths.js.srcAll+'/home/assets/js/home.js')
  .pipe(plugins.webpack({
    output: {
        filename: '[name].js',
    }
    }, null, function(err, stats) {
        // console.log(err, stats);
      /* Use stats to do more things if needed */
    }))
    .pipe(gulp.dest(config.paths.js.srcAll+'/home/assets/js'));
});

gulp.task('add', function() {
    if(argv.module) {
        var add = argv.module,
            name = add.replace(/ /g, '_')
            moduleName = name.charAt(0).toUpperCase() + name.slice(1),
            camelCase = camelCaser(moduleName),
            fileName = name.charAt(0).toLowerCase() + name.slice(1),
            dest = 'application/modules/' + fileName

        fs.stat('application/modules/'+fileName, function (err, stats) {
            if (err) {
                source = [config.paths.defaultModule+'/**/*.*', '!'+config.paths.defaultModule+'/language/**/*.*'];
                if(argv.sass)
                    source.push('!'+config.paths.defaultModuleLess+'/**/*.*');
                else {
                    source.push('!'+config.paths.defaultModuleSass+'/**/*.*');
                }
                return gulp.src(source)
                    .pipe(plugins.gulpReplace('{{Controller}}', moduleName))
                    .pipe(plugins.gulpReplace('{{CamelCase}}', camelCase))
                    .pipe(plugins.gulpReplace('{{Folder}}', fileName))
                    .pipe(plugins.rename(function(path) {
                        path.basename = fileName;
                        path.dirname.replace('default', fileName)
                    }))
                    .pipe(gulp.dest(dest));
            } else {
                plugins.util.log(plugins.util.colors.red('Módulo ' + fileName + ' já existe!'))
            }
        })
    }
});

// gulp.task('default', ['watch','compress']);
// gulp.task('dev', ['watch']);
// gulp.task('dist', ['compress']);