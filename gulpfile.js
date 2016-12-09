var gulp = require("gulp");
var wiredep = require("wiredep").stream;
var lazypipe = require("lazypipe");
var plugins = require("gulp-load-plugins")();

var sources = {
	scss: ["./public/**/*.scss", "!./public/libs/**/*"],
	css: ["./public/**/*.css", "!./public/libs/**/*"],
	js: ["./public/**/*.js", "!./public/libs/**/*"],
};

gulp.task("sass", function () {
	return gulp.src(sources.scss)
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
			gulp.src(sources.js).pipe(plugins.angularFilesort()),
			{ ignorePath: "/public", relative: true }
		))
		.pipe(plugins.inject(
			gulp.src(sources.css, { read: false }),
			{ ignorePath: "/public", relative: true }
		))
		.pipe(gulp.dest("./public"));
});

gulp.task("minify", ["inject"], function () {
	return gulp.src("./public/index.html")
        .pipe(plugins.plumber())
		.pipe(plugins.useref({}, lazypipe().pipe(plugins.sourcemaps.init, { loadMaps: true })))
        .pipe(plugins.if("*.js", plugins.uglify()))
        .pipe(plugins.if("*.css", plugins.cleanCss()))
		.pipe(plugins.sourcemaps.write("."))
        .pipe(gulp.dest("./dist"));
});
