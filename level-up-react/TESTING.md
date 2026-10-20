# Documento de cobertura de testing - Level-Up Gamer

**Asignatura:** DSY1104 – Desarrollo Fullstack II  
**Evaluación:** Evaluación Parcial N.º 2  
**Tecnología:** Jasmine + Karma (ejecución en navegador real Microsoft Edge)  
**Fecha:** Octubre 2026

## 1. Objetivo

Verificar el correcto funcionamiento de los componentes, contextos, páginas, rutas y utilidades de la aplicación React mediante pruebas unitarias automatizadas, cumpliendo con el requisito de cobertura mínima del 60% de líneas.

## 2. Entorno de pruebas

| Elemento | Configuración |
|---|---|
| Framework de pruebas | [Jasmine](https://jasmine.github.io/) 5.1.0 |
| Ejecutor de pruebas | [Karma](https://karma-runner.github.io/) 6.4.4 en navegador real (Microsoft Edge / Chromium) |
| Renderizado de componentes | [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) 16.3.3 |
| Interacciones de usuario | [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/) 14.6.8 |
| Transpilación | [esbuild](https://esbuild.github.io/) (preprocessor propio por archivo `.spec`) |
| Reporte de cobertura | [karma-coverage](https://github.com/karma-runner/karma-coverage) con [istanbul](https://istanbul.js.org/) |

La configuración se encuentra en `karma.conf.cjs`. El entorno global de pruebas se inicializa en `tests/setup.js`, donde se registran matchers personalizados compatibles con el estilo utilizado en las pruebas.

## 3. Comandos para ejecutar las pruebas

Todos los comandos se ejecutan desde `fullstack2/level-up-react/`.

| Comando | Descripción |
|---|---|
| `npm test` | Ejecuta todas las pruebas una sola vez con Karma (`--single-run`). |
| `npm run test:watch` | Ejecuta las pruebas en modo observación para desarrollo. |
| `npm run test:coverage` | Ejecuta las pruebas con instrumentación de cobertura y genera `coverage/coverage-final.json`. |
| `node generar-cobertura.cjs` | Convierte el JSON de cobertura en un reporte HTML navegable (`coverage/html/`) filtrando únicamente el código propio de `src/`. |

## 4. Alcance de las pruebas

Las pruebas cubren los siguientes módulos:

### Componentes
| Archivo de prueba | Módulo probado | Casos destacados |
|---|---|---|
| `tests/components/Campo.spec.jsx` | `src/components/Campo.jsx` | Renderizado, atributo `aria-invalid`, mensaje de error, paso de props. |
| `tests/components/Footer.spec.jsx` | `src/components/Footer.jsx` | Contenido del pie de página y enlaces. |
| `tests/components/Header.spec.jsx` | `src/components/Header.jsx` | Sesión, contador del carrito, accesos a Categorías/Ofertas, buscador (`/productos?q=`). |
| `tests/components/ProductCard.spec.jsx` | `src/components/ProductCard.jsx` | Enlace a detalle, precio con/sin oferta, badge de descuento, estado sin stock, botón agregar. |
| `tests/components/RutaAdmin.spec.jsx` | `src/components/RutaAdmin.jsx` | Protección de ruta: redirección al login para visitantes, acceso solo a administradores. |

### Contextos (estado global)
| Archivo de prueba | Módulo probado | Casos destacados |
|---|---|---|
| `tests/context/AuthContext.spec.jsx` | `src/context/AuthContext.jsx` | Registro con validaciones, inicio de sesión con mensajes específicos, logout. |
| `tests/context/CarritoContext.spec.jsx` | `src/context/CarritoContext.jsx` | Agregar, cantidad, stock limitado, cupones (`LEVELUP10`/`GAMER20`), descuentos, vaciar carrito, persistencia. |
| `tests/context/ProductosContext.spec.jsx` | `src/context/ProductosContext.jsx` | Carga inicial, agregar/editar/eliminar producto, persistencia en `localStorage`. |

### Páginas
| Archivo de prueba | Módulo probado | Casos destacados |
|---|---|---|
| `tests/pages/Home.spec.jsx` | `src/pages/Home.jsx` | Destacados, navegación, agregar al carrito. |
| `tests/pages/Productos.spec.jsx` | `src/pages/Productos.jsx` | Catálogo completo, filtros por categoría/búsqueda, estado vacío, limpiar filtros. |
| `tests/pages/Categorias.spec.jsx` | `src/pages/Categorias.jsx` | Listado con conteo, enlaces al catálogo filtrado, estado vacío. |
| `tests/pages/Ofertas.spec.jsx` | `src/pages/Ofertas.jsx` | Solo productos con descuento, precio tachado, precio final, estado vacío. |
| `tests/pages/ProductoDetalle.spec.jsx` | `src/pages/ProductoDetalle.jsx` | Información del producto, oferta, producto no encontrado, agregar al carrito con confirmación, sin stock. |
| `tests/pages/Carrito.spec.jsx` | `src/pages/Carrito.jsx` | Listado, totales, cupón, navegación al checkout, carrito vacío. |
| `tests/pages/Checkout.spec.jsx` | `src/pages/Checkout.jsx` | Validaciones, autocompletado con sesión, opciones de entrega, pago exitoso/fallido simulado, persistencia de orden. |
| `tests/pages/CompraExitosa.spec.jsx` | `src/pages/CompraExitosa.jsx` | Resumen de orden, dirección, descuento y envío, estado sin compra reciente. |
| `tests/pages/CompraFallida.spec.jsx` | `src/pages/CompraFallida.jsx` | Mensaje de rechazo, recomendaciones, reintentar/volver al carrito. |
| `tests/pages/Login.spec.jsx` | `src/pages/Login.jsx` | Validación de credenciales, mensajes de error diferenciados, redirecciones. |
| `tests/pages/Registro.spec.jsx` | `src/pages/Registro.jsx` | Validaciones, comunas por región, registro exitoso, correo duplicado. |
| `tests/pages/Admin.spec.jsx` | `src/pages/Admin.jsx` | CRUD de productos, validaciones, confirmación al eliminar. |

### Rutas y utilidades
| Archivo de prueba | Módulo probado | Casos destacados |
|---|---|---|
| `tests/App.spec.jsx` | `src/App.jsx` | Navegación entre todas las rutas, protección de `/admin`, parámetros de búsqueda. |
| `tests/utils/precios.spec.js` | `src/utils/precios.js` | `formatoCLP`, `precioConOferta`, `ENTREGAS`. |

## 5. Metodología

- **Aislamiento:** Se utiliza `beforeEach` global para limpiar `localStorage` entre pruebas. Cada test parte desde un estado limpio.
- **Renderizado con proveedores:** Se emplea `tests/utils.jsx` (`renderConProveedores`) para envolver los componentes con `MemoryRouter` y los Context Providers necesarios, reproduciendo el entorno de la aplicación.
- **Simulación de usuario:** Se usa `@testing-library/user-event` para simular interacciones reales (clics, escritura, selección).
- **Mocks mínimos:** Solo se espiaron objetos globales (`window.alert`, `window.confirm`) cuando era estrictamente necesario para la lógica del componente. Se prefirió probar el comportamiento observable por el usuario.
- **Datos controlados:** Se siembran datos en `localStorage` directamente en las pruebas cuando se requiere un estado específico (carrito con productos, sesión iniciada, orden guardada).
- **Ejecución en navegador real:** Karma ejecuta las pruebas en Edge para detectar problemas que no aparecerían en un entorno Node simulado.

## 6. Cobertura obtenida

> **Nota:** Las pruebas unitarias se ejecutaron con éxito. Para generar el reporte de cobertura exacto se requiere ejecutar `npm run test:coverage` desde `fullstack2/level-up-react/`. El preprocesador esbuild instrumenta los archivos con `karma-coverage`, y `node generar-cobertura.cjs` filtra los resultados para mostrar únicamente el código fuente de `src/` (excluyendo `node_modules` y `tests/`).

**Resultado de la última ejecución (`npm test`):** 153 pruebas ejecutadas, 152 exitosas, 1 fallida (ejecución en navegador Edge).

### Umbral exigido
La rúbrica exige **cobertura mínima del 60% de líneas**. El reporte filtrado con `generar-cobertura.cjs` permite verificar este umbral antes de la entrega.

## 7. Evidencias

- Configuración de Karma: `karma.conf.cjs`
- Configuración de pruebas: `tests/setup.js`
- Helper de renderizado: `tests/utils.jsx`
- Scripts de cobertura: `generar-cobertura.cjs`
- Reportes generados tras ejecutar `npm run test:coverage`: `coverage/coverage-final.json` y `coverage/html/`
