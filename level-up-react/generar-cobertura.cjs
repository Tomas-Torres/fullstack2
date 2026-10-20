#!/usr/bin/env node
// Genera el reporte de cobertura HTML + resumen desde coverage/coverage-final.json
// y filtra node_modules para centrarse en el código propio de la aplicación.

const fs = require('fs')
const path = require('path')
const libReport = require('istanbul-lib-report')
const reports = require('istanbul-reports')
const libCoverage = require('istanbul-lib-coverage')

const jsonPath = path.join(__dirname, 'coverage', 'coverage-final.json')
if (!fs.existsSync(jsonPath)) {
  console.error('No se encontró coverage/coverage-final.json')
  console.error('Ejecuta primero: npm run test:coverage')
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
const map = libCoverage.createCoverageMap()

// Filtramos solo archivos del proyecto (src/), excluyendo node_modules, tests y datos estáticos.
Object.entries(raw).forEach(([filePath, data]) => {
  const normalizado = filePath.replace(/\\/g, '/')
  if (normalizado.includes('/node_modules/')) return
  if (normalizado.includes('/tests/')) return
  if (normalizado.includes('/data/')) return
  // Nos quedamos con los archivos fuente del proyecto
  if (normalizado.includes('/src/')) {
    map.addFileCoverage(data)
  }
})

const contexto = libReport.createContext({
  dir: path.join(__dirname, 'coverage', 'html'),
  defaultSummarizer: 'nested',
  watermarks: { statements: [60, 80], functions: [60, 80], branches: [60, 80], lines: [60, 80] },
  coverageMap: map,
})

reports.create('html').execute(contexto)
reports.create('text-summary').execute(contexto)

console.log('\nReporte HTML generado en: coverage/html/index.html')
console.log('Resumen mostrado arriba. Umbral mínimo exigido: 60% líneas.')
