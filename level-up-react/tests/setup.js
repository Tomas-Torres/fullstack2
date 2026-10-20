// Configuración global del entorno de pruebas (Jasmine + Karma en navegador real).

// Matchers personalizados con los que se escribe limpio en las pruebas,
// al estilo de los que ofrece Jest: toBeInTheDocument, toBeDisabled, etc.
beforeEach(() => {
  jasmine.addMatchers({
    toBeInTheDocument() {
      return {
        compare(elemento) {
          const pass = elemento != null && document.body.contains(elemento)
          return {
            pass,
            message: `expected el elemento ${pass ? 'no ' : ''}está en el documento`,
          }
        },
      }
    },
    toBeDisabled() {
      return {
        compare(elemento) {
          const pass = elemento != null && elemento.disabled === true
          return {
            pass,
            message: `expected el elemento ${pass ? 'no ' : ''}está deshabilitado`,
          }
        },
      }
    },
    toHaveClass() {
      return {
        compare(elemento, esperada) {
          const pass = elemento != null && elemento.classList.contains(esperada)
          return {
            pass,
            message: `expected la clase "${esperada}" ${pass ? 'no ' : ''}está presente`,
          }
        },
      }
    },
    toHaveAttribute() {
      return {
        compare(elemento, attr, valorEsperado) {
          if (elemento == null || !elemento.hasAttribute(attr)) {
            return { pass: false, message: `expected el elemento tiene el atributo "${attr}"` }
          }
          if (valorEsperado === undefined) return { pass: true, message: `expected el atributo "${attr}" no está presente` }
          const pass = elemento.getAttribute(attr) === valorEsperado
          return {
            pass,
            message: `expected el atributo "${attr}" ${pass ? 'no ' : ''}es "${valorEsperado}" (obtenido: "${elemento.getAttribute(attr)}")`,
          }
        },
      }
    },
    toHaveValue() {
      return {
        compare(elemento, valorEsperado) {
          const pass = elemento != null && elemento.value === valorEsperado
          return {
            pass,
            message: `expected el valor ${pass ? 'no ' : ''}es "${valorEsperado}" (obtenido: "${elemento && elemento.value}")`,
          }
        },
      }
    },
    toHaveLength() {
      return {
        compare(coleccion, cantidad) {
          const pass = coleccion != null && coleccion.length === cantidad
          return {
            pass,
            message: `expected la colección tiene longitud ${pass ? 'distinta de ' : ''}${cantidad} (obtenido: ${coleccion && coleccion.length})`,
          }
        },
      }
    },
    toHaveTextContent() {
      return {
        compare(elemento, texto) {
          const contenido = elemento ? elemento.textContent : ''
          const pass = typeof texto === 'string' ? contenido.includes(texto) : texto.test(contenido)
          return {
            pass,
            message: `expected el elemento ${pass ? 'no ' : ''}contiene el texto "${texto}" (obtenido: "${contenido}")`,
          }
        },
      }
    },
  })
})

beforeEach(() => {
  // Cada prueba parte con localStorage vacío, para que no dependan unas de otras.
  localStorage.clear()
  // En navegador real scrollTo funciona, pero no queremos scroll durante las pruebas.
  window.scrollTo = () => {}
})
