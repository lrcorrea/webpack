//https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
/*
 .pipe(rename(function(path) {
        path.dirname = entryPath + '/../js';
    }))
    .pipe(gulp.dest('./'))
*/
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
            },
            pages: ['application/modules/*.html']
        }
    },
    plugins = {
        cssmin:      loadPlugin('gulp-minify-css'),
        // webpack:     loadPlugin('webpack-stream'),
        typescript:     loadPlugin('gulp-typescript'),
        browserify:     loadPlugin('browserify'),
        source:     loadPlugin('vinyl-source-stream'),
        watchify:     loadPlugin('watchify'),
        tsify:     loadPlugin('tsify'),
        sourcemaps:     loadPlugin('gulp-sourcemaps'),
        debug:       loadPlugin('gulp-debug'),
        gulpReplace: loadPlugin('gulp-replace'),
        less:        loadPlugin('gulp-less'),
        notify:      loadPlugin('gulp-notify'),
        rename:      loadPlugin('gulp-rename'),
        util:        loadPlugin('gulp-util')
    };
    //tsProject = plugins.ts.createProject("tsconfig.json");


var watchedBrowserify = plugins.watchify(plugins.browserify({
    basedir: '.',
    debug: true,
    entries: [config.paths.js.srcAll+'/main/assets/js/main.ts'],
    cache: {},
    packageCache: {}
}).plugin(plugins.tsify));

gulp.task("copy-html", function () {
    return gulp.src(config.paths.pages)
        .pipe(gulp.dest("dist"));
});

function bundle() {
    return watchedBrowserify
        .bundle()
        .pipe(plugins.source('bundle.js'))
        .pipe(gulp.dest("dist"));
}

gulp.task("default", ["copy-html"], bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", plugins.util.log);


/*gulp.task('default', function() {
    var tsResult = gulp.src([config.paths.js.srcAll+'/*.ts'])
        .pipe(plugins.sourcemaps.init({loadMaps: true})) // This means sourcemaps will be generated
        .pipe(plugins.typescript({
            noImplicitAny: true,
            // console.log('pipe ts');
        }));

        // console.log(tsResult);

    return tsResult.js
        .pipe(plugins.sourcemaps.write(config.paths.js.srcAll)) // Now the sourcemaps are added to the .js file
        .pipe(gulp.dest('dist'));
});*/

/*gulp.task('default', function () {
    return gulp.src(config.paths.js.srcAll)
        .pipe(ts({
            noImplicitAny: true,
            outFile: 'main.js'
        }))
        .pipe(gulp.dest('built/local'));
});*/

// gulp.task("default", function () {
//     return tsProject.src()
//         .pipe(tsProject())
//         .js.pipe(gulp.dest("dist"));
// });

//webpack
/*gulp.task('default', function() {
  return gulp.src(config.paths.js.srcAll+'/home/assets/js/home.js')
  .pipe(plugins.webpack({
    watch: true,
    output: {
        filename: '[name].js',
    }
    }, null, function(err, stats) {
        // console.log(err, stats);
    }))
    .pipe(gulp.dest(config.paths.js.srcAll+'/home/assets/js'));
});*/

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
