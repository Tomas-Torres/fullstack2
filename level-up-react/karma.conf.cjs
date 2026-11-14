const fs = require('fs')
const createEsbuildPreprocessor = require('./karma.pp.cjs')

if (!process.env.CHROME_BIN) {
  const candidatos = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ]
  const encontrado = candidatos.find((ruta) => fs.existsSync(ruta))
  if (encontrado) process.env.CHROME_BIN = encontrado
}

module.exports = function (config) {
  const conCobertura = process.argv.includes('--coverage')
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-coverage',
      { 'preprocessor:esbuild': ['factory', createEsbuildPreprocessor] },
    ],
    files: ['tests/setup.js', 'tests/**/*.spec.js', 'tests/**/*.spec.jsx'],
    preprocessors: {
      'tests/setup.js': ['esbuild'],
      'tests/**/*.spec.js': conCobertura ? ['esbuild', 'coverage'] : ['esbuild'],
      'tests/**/*.spec.jsx': conCobertura ? ['esbuild', 'coverage'] : ['esbuild'],
    },
    coverageReporter: {
      dir: 'coverage',
      subdir: '.',
      reporters: [
        { type: 'json', file: 'coverage-final.json' },
        { type: 'text-summary' },
      ],
    },
    reporters: conCobertura ? ['progress', 'coverage'] : ['progress'],
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    client: {
      jasmine: { random: false },
    },
    singleRun: true,
    concurrency: 1,
  })
}
