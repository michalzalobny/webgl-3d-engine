const sass = require("node-sass");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const CleanCSS = require("clean-css");
const fs = require("fs-extra");
const path = require("path");

const srcDir = path.join(__dirname, "src", "styles");
const outDir = path.join(__dirname, "dist", "css");

const isProduction = process.env.NODE_ENV === "production";

// Empty the output directory
fs.emptyDirSync(outDir);

fs.readdir(srcDir, (err, files) => {
  if (err) throw err;

  files.forEach((file) => {
    if (path.extname(file) === ".scss") {
      const srcFile = path.join(srcDir, file);
      const outFile = path.join(outDir, file.replace(".scss", ".css"));

      sass.render(
        {
          file: srcFile,
          outputStyle: isProduction ? "compressed" : "expanded",
        },
        (err, result) => {
          if (err) throw err;

          postcss([autoprefixer])
            .process(result.css, { from: srcFile, to: outFile })
            .then((result) => {
              let outputCss = result.css;

              if (isProduction) {
                outputCss = new CleanCSS({}).minify(result.css).styles;
              }

              fs.writeFile(outFile, outputCss, (err) => {
                if (err) throw err;
              });
            });
        }
      );
    }
  });
});
