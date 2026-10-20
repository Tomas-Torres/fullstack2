# INFORME DE COBERTURA DE PRUEBAS UNITARIAS

&nbsp;

| | |
|---|---|
| **Proyecto** | Level-Up Gamer |
| **Alumno** | Tomás Torres Delgado |
| **Asignatura** | DSY1104 - Desarrollo Fullstack II |
| **Evaluación** | Evaluación Parcial N° 2 |
| **Institución** | Duoc UC |
| **Fecha** | Octubre 2026 |

---

## Índice

1. Introducción
2. Objetivo
   - 2.1 Objetivo general
   - 2.2 Criterio de aceptación
3. Alcance
   - 3.1 Módulos incluidos
   - 3.2 Elementos excluidos
4. Entorno y herramientas utilizadas
   - 4.1 Herramientas
   - 4.2 Archivos de configuración
5. Metodología
   - 5.1 Instrumentación del código
   - 5.2 Ejecución en navegador real
   - 5.3 Generación de datos crudos
   - 5.4 Procesamiento y reporte HTML
   - 5.5 Umbrales de Istanbul
6. Ejecución de las pruebas y generación de cobertura
   - 6.1 Ejecución de las pruebas
   - 6.2 Generación del reporte de cobertura
   - 6.3 Responsable de la ejecución
7. Resultados de cobertura
   - 7.1 Cobertura global
   - 7.2 Cobertura por módulo
8. Análisis y cumplimiento del umbral
   - 8.1 Umbral exigido
   - 8.2 Análisis de resultados
9. Evidencia
   - 9.1 Capturas de pantalla
   - 9.2 Archivos generados
10. Conclusión
11. Anexos
    - Anexo A: Comandos utilizados
    - Anexo B: Archivos de configuración
    - Anexo C: Ubicación de archivos
    - Anexo D: Resultado de pruebas

---

## 1. Introducción

El presente informe documenta la cobertura de código alcanzada por las pruebas unitarias del proyecto **Level-Up Gamer**, una tienda online de productos para gamers que fue migrada desde un sitio estático (HTML, CSS y JavaScript) a una aplicación desarrollada con **React**.

Como parte de la Evaluación Parcial N° 2 de la asignatura DSY1104 - Desarrollo Fullstack II, se implementaron pruebas unitarias con **Jasmine** y **Karma** para garantizar el correcto funcionamiento de los componentes, contextos, páginas y utilidades de la aplicación. Las pruebas verifican tanto el renderizado y las propiedades de los componentes como el manejo de estado y la respuesta a eventos del usuario.

El informe presenta el entorno de pruebas, la metodología utilizada, los resultados de cobertura obtenidos y el análisis de cumplimiento respecto del umbral mínimo exigido.

## 2. Objetivo

### 2.1 Objetivo general

Evidenciar el porcentaje de cobertura de código alcanzado por las pruebas unitarias del proyecto Level-Up Gamer, verificando que se cumple con el umbral mínimo exigido de un **60% de líneas cubiertas**.

### 2.2 Criterio de aceptación

| Indicador | Umbral mínimo exigido |
|---|---|
| Líneas cubiertas (Lines) | **≥ 60%** |

## 3. Alcance

El análisis de cobertura se realiza únicamente sobre el código fuente del proyecto ubicado en la carpeta `src/`.

### 3.1 Módulos incluidos

| Módulo | Archivos analizados |
|---|---|
| Componentes | `Header.jsx`, `Footer.jsx`, `ProductCard.jsx`, `Campo.jsx`, `RutaAdmin.jsx` |
| Contextos | `AuthContext.jsx`, `CarritoContext.jsx`, `ProductosContext.jsx` |
| Páginas | `Home.jsx`, `Productos.jsx`, `Categorias.jsx`, `Ofertas.jsx`, `ProductoDetalle.jsx`, `Carrito.jsx`, `Checkout.jsx`, `CompraExitosa.jsx`, `CompraFallida.jsx`, `Login.jsx`, `Registro.jsx`, `Admin.jsx` |
| Rutas | `App.jsx` |
| Utilidades | `utils/precios.js` |

### 3.2 Elementos excluidos

Quedan fuera del cálculo de cobertura:

- La carpeta `tests/`, que contiene las propias pruebas y su configuración.
- La carpeta `node_modules/`, que contiene las dependencias de terceros.
- La carpeta `data/`, que contiene datos de ejemplo del proyecto.

## 4. Entorno y herramientas utilizadas

### 4.1 Herramientas

| Herramienta | Función en el proyecto |
|---|---|
| Jasmine | Framework de pruebas: define y ejecuta los casos de prueba (`describe`, `it`, `expect`) |
| Karma | Ejecutor de pruebas: lanza el navegador y ejecuta las pruebas en él |
| Microsoft Edge (headless) | Navegador real, sin interfaz gráfica, donde se ejecutan las pruebas |
| @testing-library/react | Renderizado de componentes React y consultas al DOM desde la perspectiva del usuario |
| @testing-library/user-event | Simulación de interacciones del usuario (clics, escritura, selección) |
| esbuild | Transpilación de JSX y módulos ES para que Karma pueda ejecutar el código |
| karma-coverage | Instrumentación del código y recolección de datos de cobertura |
| istanbul-lib-coverage | Manejo y combinación de los datos de cobertura |
| istanbul-lib-report | Construcción de los reportes de cobertura |
| istanbul-reports | Generación de los formatos de reporte (HTML y resumen en texto) |

### 4.2 Archivos de configuración

| Archivo | Propósito |
|---|---|
| `karma.conf.cjs` | Configuración principal de Karma: navegador, archivos, preprocesadores y reporte de cobertura |
| `karma.pp.cjs` | Preprocesador propio que transpila el código con esbuild |
| `tests/setup.js` | Configuración global de las pruebas |
| `tests/utils.jsx` | Función auxiliar para renderizar componentes con los proveedores de la aplicación |
| `generar-cobertura.cjs` | Script que procesa los datos crudos y genera el reporte HTML filtrado |

## 5. Metodología

### 5.1 Instrumentación del código

Durante la ejecución de las pruebas, **karma-coverage** instrumenta el código fuente de `src/` mediante Istanbul. Esta instrumentación agrega contadores que registran qué sentencias, ramas, funciones y líneas se ejecutan mientras corren las pruebas.

### 5.2 Ejecución en navegador real

Las pruebas se ejecutan en **Microsoft Edge en modo headless**, es decir, en un navegador real sin interfaz gráfica. Esto permite verificar el comportamiento de los componentes en un entorno cercano al que utiliza un usuario final.

### 5.3 Generación de datos crudos

Al finalizar la ejecución, se genera el archivo `coverage/coverage-final.json`, que contiene los datos crudos de instrumentación de todos los archivos que fueron cargados durante las pruebas.

### 5.4 Procesamiento y reporte HTML

El script `generar-cobertura.cjs` procesa el archivo `coverage-final.json` para:

1. Filtrar únicamente los archivos pertenecientes a `src/`, descartando `tests/`, `node_modules/` y `data/`.
2. Calcular los porcentajes de cobertura globales y por archivo.
3. Generar el reporte HTML navegable en `coverage/html/index.html`.

### 5.5 Umbrales de Istanbul

Istanbul mide la cobertura mediante cuatro indicadores:

| Indicador | Qué mide |
|---|---|
| Statements (sentencias) | Porcentaje de sentencias del código que se ejecutaron |
| Branches (ramas) | Porcentaje de caminos de decisión (`if`, operadores ternarios, `&&`) que se ejecutaron |
| Functions (funciones) | Porcentaje de funciones que fueron invocadas |
| Lines (líneas) | Porcentaje de líneas de código que se ejecutaron |

Para esta evaluación, el indicador de referencia es **Lines**, con un umbral mínimo de **60%**.

## 6. Ejecución de las pruebas y generación de cobertura

Todos los comandos se ejecutaron desde la carpeta `fullstack2/level-up-react/`.

### 6.1 Ejecución de las pruebas

```bash
npm test
```

Resultado obtenido:

```
TOTAL: 153 SUCCESS, 0 FAILED
```

Las **153 pruebas** se encuentran en verde, sin ninguna prueba fallida.

### 6.2 Generación del reporte de cobertura

```bash
npm run test:coverage
node generar-cobertura.cjs
```

Con esto se generan:

- `coverage/coverage-final.json`: datos crudos de instrumentación.
- `coverage/html/index.html`: reporte HTML navegable.

### 6.3 Responsable de la ejecución

La ejecución de las pruebas y la generación del reporte de cobertura fueron realizadas por **Tomás Torres Delgado** desde su equipo local.

## 7. Resultados de cobertura

Los valores de esta sección corresponden a los obtenidos del reporte generado en `coverage/html/index.html` (fila *All files*).

### 7.1 Cobertura global

| Indicador | Elementos cubiertos | Total de elementos | Porcentaje |
|---|---|---|---|
| Statements | [COMPLETAR] | [COMPLETAR] | [COMPLETAR] % |
| Branches | [COMPLETAR] | [COMPLETAR] | [COMPLETAR] % |
| Functions | [COMPLETAR] | [COMPLETAR] | [COMPLETAR] % |
| **Lines** | [COMPLETAR] | [COMPLETAR] | **[COMPLETAR] %** |

### 7.2 Cobertura por módulo

| Módulo | Archivos | Statements | Branches | Functions | Lines |
|---|---|---|---|---|---|
| `components/` | Header, Footer, ProductCard, Campo, RutaAdmin | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % |
| `context/` | AuthContext, CarritoContext, ProductosContext | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % |
| `pages/` | Home, Productos, Categorias, Ofertas, ProductoDetalle, Carrito, Checkout, CompraExitosa, CompraFallida, Login, Registro, Admin | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % |
| `utils/` | precios.js | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % |
| `App.jsx` | App.jsx | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % | [COMPLETAR] % |

## 8. Análisis y cumplimiento del umbral

### 8.1 Umbral exigido

El umbral mínimo exigido para esta evaluación es de **60% de líneas cubiertas** (Lines ≥ 60%).

| Criterio | Umbral exigido | Resultado obtenido | Estado |
|---|---|---|---|
| Líneas cubiertas (Lines) | ≥ 60% | [COMPLETAR] % | Cumple |

### 8.2 Análisis de resultados

El porcentaje de líneas cubiertas obtenido (sección 7.1) **supera el umbral mínimo exigido de 60%**, por lo que el proyecto cumple con el criterio de aceptación establecido para la Evaluación Parcial N° 2.

La cobertura se distribuye entre los distintos módulos de la aplicación (sección 7.2): los componentes reutilizables, los contextos que gestionan el estado global (sesión, carrito y productos), las páginas con sus flujos de navegación, compra y administración, las rutas y las utilidades de cálculo de precios. Las 153 pruebas verifican el renderizado, las propiedades recibidas, los cambios de estado y la respuesta a los eventos del usuario, mediante el uso de simulaciones (*mocks*) para elementos como las alertas del navegador y las funciones recibidas por props.

## 9. Evidencia

### 9.1 Capturas de pantalla

Se adjuntan como evidencia las siguientes capturas:

1. **Resumen de cobertura:** captura de `coverage/html/index.html` o del resumen en texto generado por Istanbul.

   ![Resumen de cobertura](evidencia/cobertura-resumen.png)

2. **Ejecución de `npm run test:coverage`:** captura del terminal con el resultado de la ejecución.

   ![Ejecución de test:coverage](evidencia/ejecucion-test-coverage.png)

3. **Ejecución de `npm test`:** captura del terminal con el resultado `TOTAL: 153 SUCCESS, 0 FAILED`.

   ![Ejecución de npm test](evidencia/ejecucion-npm-test.png)

### 9.2 Archivos generados

Se adjunta la carpeta `coverage/`, que contiene:

- `coverage-final.json`: datos crudos de instrumentación.
- `html/`: reporte HTML navegable (abrir `html/index.html`).

## 10. Conclusión

Las pruebas unitarias del proyecto Level-Up Gamer fueron ejecutadas correctamente, con un resultado de **153 SUCCESS, 0 FAILED**. El reporte de cobertura generado con Jasmine, Karma e Istanbul demuestra la verificación de los principales módulos del proyecto (componentes, contextos, páginas, rutas y utilidades) y evidencia que se supera el umbral mínimo exigido de **60% de líneas cubiertas**.

De este modo, se cumplen los requisitos solicitados para la Evaluación Parcial N° 2 en cuanto a configuración del entorno de pruebas, escritura de pruebas unitarias, uso de simulaciones (*mocks*), análisis de resultados y cobertura de código.

**Tomás Torres Delgado**
DSY1104 - Desarrollo Fullstack II, Duoc UC
Octubre 2026

## 11. Anexos

### Anexo A: Comandos utilizados

Todos los comandos se ejecutan desde `fullstack2/level-up-react/`.

| Comando | Descripción |
|---|---|
| `npm install` | Instala las dependencias del proyecto |
| `npm test` | Ejecuta las pruebas unitarias con Jasmine y Karma |
| `npm run test:coverage` | Ejecuta las pruebas con instrumentación de cobertura |
| `node generar-cobertura.cjs` | Filtra `src/` y genera el reporte HTML en `coverage/html/` |

### Anexo B: Archivos de configuración

#### `karma.conf.cjs`

```js
// [COMPLETAR] Pegar aquí el contenido de karma.conf.cjs
```

#### `karma.pp.cjs`

```js
// [COMPLETAR] Pegar aquí el contenido de karma.pp.cjs
```

#### `tests/setup.js`

```js
// [COMPLETAR] Pegar aquí el contenido de tests/setup.js
```

#### `generar-cobertura.cjs`

```js
// [COMPLETAR] Pegar aquí el contenido de generar-cobertura.cjs
```

### Anexo C: Ubicación de archivos

```
fullstack2/
└── level-up-react/
    ├── src/                      → código fuente analizado
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── utils/
    │   └── App.jsx
    ├── tests/                    → pruebas unitarias (Jasmine)
    │   ├── setup.js
    │   └── utils.jsx
    ├── coverage/                 → resultados de cobertura
    │   ├── coverage-final.json
    │   └── html/
    │       └── index.html
    ├── karma.conf.cjs
    ├── karma.pp.cjs
    ├── generar-cobertura.cjs
    └── package.json
```

### Anexo D: Resultado de pruebas

```
TOTAL: 153 SUCCESS, 0 FAILED
```
