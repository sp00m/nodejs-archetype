var gulp = require("gulp");
var plugins = require("gulp-load-plugins")();

var del = require("del");
var deleteEmpty = require("delete-empty");
var lazypipe = require("lazypipe");
var mainBowerFiles = require("main-bower-files");
var wiredep = require("wiredep").stream;

gulp.task("sass", function () {
	return gulp.src(["./public/**/*.scss", "!./public/libs/**/*"])
        .pipe(plugins.plumber())
		.pipe(plugins.sass.sync().on("error", plugins.sass.logError))
		.pipe(gulp.dest("./public"));
});

gulp.task("inject", ["sass"], function () {
	return gulp.src("./public/index.src.html")
        .pipe(plugins.plumber())
		.pipe(plugins.rename("index.html"))
		.pipe(wiredep())
		.pipe(plugins.inject(
			gulp.src(["./public/**/*.js", "!./public/libs/**/*"]).pipe(plugins.angularFilesort()),
			{ ignorePath: "/public", relative: true }
		))
		.pipe(plugins.inject(
			gulp.src(["./public/**/*.css", "!./public/libs/**/*"], { read: false }),
			{ ignorePath: "/public", relative: true }
		))
		.pipe(gulp.dest("./public"));
});

gulp.task("clean", function () {
    return del("./dist");
});

gulp.task("init", ["clean", "inject"], function () {
    return gulp.src(["./public/**/*", "!./public/index.src.html", "!./public/**/*.scss", "!./public/libs/**/*"])
        .pipe(plugins.plumber())
        .pipe(gulp.dest("./dist/public"));
});

gulp.task("deps", ["init"], function () {
    return gulp.src(mainBowerFiles(), { base: "./public/libs" })
        .pipe(plugins.plumber())
        .pipe(plugins.if("*.css", plugins.cssretarget({ root: "/public" })))
        .pipe(gulp.dest("./dist/public/libs"));
});

gulp.task("minify", ["deps"], function () {
	return gulp.src("./dist/public/index.html")
        .pipe(plugins.plumber())
		.pipe(plugins.useref({}, lazypipe().pipe(plugins.sourcemaps.init, { loadMaps: true })))
        .pipe(plugins.if("*.css", plugins.cleanCss()))
        .pipe(plugins.if("*.js", plugins.uglify()))
		.pipe(plugins.sourcemaps.write("."))
        .pipe(gulp.dest("./dist/public"));
});

gulp.task("dist", ["minify"], function () {
    return del(["./dist/public/**/*.{css,js}", "!./dist/public/scripts.js", "!./dist/public/styles.css"]).then(function () {
        return deleteEmpty.sync("./dist/public");
    });
});
