const fs = require('fs')
const path = require('path')
const esbuild = require('esbuild')

// Complementos de Babel que necesita Istanbul para leer JSX y sintaxis moderna.
const SINTAXIS = [
  'jsx',
  'importMeta',
  'dynamicImport',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'objectRestSpread',
  'optionalCatchBinding',
  'topLevelAwait',
  'numericSeparator',
]

/**
 * Instrumenta con Istanbul los archivos de src/ mientras esbuild los empaqueta.
 *
 * Se instrumenta el codigo original (no el bundle minificado), de modo que las
 * lineas del informe de cobertura coinciden con los archivos reales.
 */
function pluginCobertura() {
  const { createInstrumenter } = require('istanbul-lib-instrument')
  const instrumenter = createInstrumenter({
    esModules: true,
    coverageVariable: '__coverage__',
    parserPlugins: SINTAXIS,
  })

  return {
    name: 'istanbul-src',
    setup(build) {
      build.onLoad({ filter: /[\\/]src[\\/].*\.(js|jsx)$/ }, async (args) => {
        const codigo = await fs.promises.readFile(args.path, 'utf8')
        return {
          contents: instrumenter.instrumentSync(codigo, args.path),
          loader: args.path.endsWith('.jsx') ? 'jsx' : 'js',
        }
      })
    },
  }
}

module.exports = function createEsbuildPreprocessor(logger) {
  const log = logger.create ? logger.create('preprocessor.esbuild') : logger
  const conCobertura = process.argv.includes('--coverage')
  return function (contenido, archivo, done) {
    esbuild
      .build({
        stdin: {
          contents: contenido,
          loader: 'jsx',
          resolveDir: path.dirname(archivo.originalPath),
          sourcefile: archivo.originalPath,
        },
        bundle: true,
        write: false,
        format: 'iife',
        target: 'es2020',
        jsx: 'automatic',
        minify: true,
        sourcemap: conCobertura ? 'inline' : false,
        define: { 'process.env.NODE_ENV': '"development"' },
        plugins: conCobertura ? [pluginCobertura()] : [],
        logLevel: 'silent',
      })
      .then((resultado) => {
        const js = resultado.outputFiles.find((o) => !o.path.endsWith('.map'))
        if (!js) return done(new Error('Sin salida JS de esbuild'), null)
        const coincidencia = /\/\/# sourceMappingURL=data:application\/json;base64,(.+)$/m.exec(js.text)
        if (coincidencia) {
          try {
            archivo.sourceMap = JSON.parse(Buffer.from(coincidencia[1], 'base64').toString('utf8'))
          } catch (e) {
            if (log && log.error) log.error(e.message)
          }
        }
        done(null, coincidencia ? js.text.replace(coincidencia[0], '') : js.text)
      })
      .catch((error) => {
        if (log && log.error) log.error(error.message)
        done(error, null)
      })
  }
}
