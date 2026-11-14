const path = require('path')
const esbuild = require('esbuild')

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
