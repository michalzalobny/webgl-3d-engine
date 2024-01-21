const htmlmin = require("html-minifier").minify;

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/eleventy/public");

  //Minify HTML
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  return {
    dir: {
      input: "src/eleventy",
      output: "dist",
    },
  };
};
