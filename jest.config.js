module.exports = {
    verbose: true,
    globalSetup: './test/setup.js',
    globalTeardown: './test/teardown.js',
    collectCoverageFrom: [
        "**/*.js",
        "!**/*.config.js",
        "!**/node_modules/**",
        "!**/coverage/**",
        "!**/test/**",
      ]
}