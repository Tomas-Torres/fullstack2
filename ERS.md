# Especificación de Requisitos de Software (ERS)
## Proyecto: Level-Up Gamer

**Asignatura:** DSY1104 – Desarrollo Fullstack II
**Autor:** Tomás Torres Delgado
**Versión:** 3.0 (Noviembre 2026)

### Historial de versiones

| Versión | Fecha | Evaluación | Cambios |
|---|---|---|---|
| 1.0 | Septiembre 2026 | Evaluación Formativa N.° 1 | Sitio estático con HTML, CSS, Bootstrap y JavaScript (4 vistas) |
| 2.0 | Octubre 2026 | Evaluación Parcial N.° 2 | Migración a React: rutas, estado global, sesión con roles y panel de administración con CRUD |
| 3.0 | Noviembre 2026 | EP3 y EFT | Backend de cuatro microservicios con Spring Boot, MySQL, JWT, roles reales, despliegue en EC2 t3.micro y frontend integrado por API |

---

## 1. Introducción

Level-Up Gamer es una tienda online dedicada a los entusiastas de los videojuegos en Chile. Ofrece productos para gamers, desde juegos de mesa y accesorios hasta consolas, computadores y sillas especializadas. No cuenta con una ubicación física y realiza despachos a todo el país.

Este documento describe los requisitos funcionales y no funcionales del sistema en su versión 3.0. A diferencia de las entregas anteriores, la aplicación ya no funciona solo en el navegador: el frontend React consume cuatro microservicios Spring Boot que validan las reglas de negocio, autentican con JWT y persisten la información en MySQL.

## 2. Propósito y alcance

El sistema permite:

- Registrarse e iniciar sesión con autenticación real y roles (`CLIENTE` y `ADMIN`).
- Explorar el catálogo de productos y filtrar por categoría o búsqueda.
- Administrar el carrito de compras con validación de stock y cupones calculados en el servidor.
- Simular el pago con tarjeta o transferencia y guardar el resultado del cobro.
- Administrar usuarios, productos y categorías desde un panel exclusivo para el administrador.

El alcance incluye frontend, backend y base de datos, todo desplegable con Docker Compose en una única instancia **t3.micro** de AWS.

### Fuera de alcance

- Pasarela de pago real y conexión con bancos.
- Envío de correos de confirmación o recuperación de contraseña.
- Microservicio de órdenes, boletas o facturación electrónica.
- Microservicio de reportes y estadísticas.
- Integración con servicios de despacho o inventario externo.
- Registro de auditoría de acciones administrativas.
- Alta disponibilidad, balanceo de carga o múltiples instancias.

## 3. Actores del sistema

| Actor | Descripción |
|---|---|
| Visitante | Usuario sin sesión. Puede ver el catálogo, filtrar productos, armar un carrito local y registrarse o iniciar sesión. |
| Cliente | Usuario autenticado con rol `CLIENTE`. Gestiona su carrito en el servidor, aplica cupones y registra pagos. |
| Administrador | Usuario autenticado con rol `ADMIN`. Además de comprar, administra usuarios, productos y categorías, y consulta el historial de pagos. |
| ms-productos | Actor interno consultado por `ms-carrito` para validar existencia, precio y stock de un producto. |
| MySQL | Actor interno de persistencia, con una base de datos independiente por microservicio. |

## 4. Requisitos funcionales

La columna *Etapa* indica desde qué versión está implementado cada requisito.

### 4.1 Registro, autenticación y sesión

| N.° | Requisito | Etapa |
|---|---|---|
| RF-01 | El sistema debe permitir registrar un usuario con nombre, correo, contraseña, teléfono opcional, región y comuna. | EP1–EP3 |
| RF-02 | El backend debe rechazar con `409` un correo ya registrado, sin distinguir mayúsculas de minúsculas. | EP3 |
| RF-03 | La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y un símbolo entre `@#$%!.*`; el backend debe validarla y almacenarla cifrada con BCrypt. | EP1–EP3 |
| RF-04 | El backend debe validar nombre, correo, teléfono móvil chileno, región y comuna, y responder `400` con el detalle del campo inválido. | EP3 |
| RF-05 | Las comunas del formulario deben depender de la región seleccionada. | EP1–EP3 |
| RF-06 | Los errores de validación deben mostrarse junto al campo correspondiente, sin recargar la página. | EP1–EP3 |
| RF-07 | El sistema debe permitir iniciar sesión con correo y contraseña y responder `200` con un JWT y el rol del usuario. | EP2 y EP3 |
| RF-08 | El login debe responder `401` con un mensaje claro cuando las credenciales son incorrectas. | EP2 y EP3 |
| RF-09 | La sesión debe mantenerse al recargar la página y el usuario debe poder cerrarla. | EP2 y EP3 |
| RF-10 | El token JWT debe viajar en la cabecera `Authorization: Bearer <token>` y expirar a las 2 horas por defecto. | EP3 |
| RF-11 | Un usuario desactivado no debe poder iniciar sesión ni usar un token vigente. | EP3 |
| RF-12 | El registro público siempre debe asignar el rol `CLIENTE`; solo un administrador puede crear usuarios con otro rol. | EP3 |

### 4.2 Usuarios

| N.° | Requisito | Etapa |
|---|---|---|
| RF-13 | El administrador debe poder listar todos los usuarios y consultar uno por identificador. | EP3 |
| RF-14 | El administrador debe poder crear usuarios indicando rol y estado, y recibir `201` con el recurso creado. | EP3 |
| RF-15 | El administrador debe poder actualizar y eliminar usuarios; la eliminación debe responder `204`. | EP3 |
| RF-16 | Un cliente solo puede consultar y editar su propio perfil; el intento de acceder a otro debe responder `403`. | EP3 |
| RF-17 | Solo el administrador puede cambiar el rol o el estado de un usuario. | EP3 |
| RF-18 | El sistema debe permitir verificar si un correo existe, sin autenticación, para validar el registro desde el frontend. | EP3 |

### 4.3 Catálogo y categorías

| N.° | Requisito | Etapa |
|---|---|---|
| RF-19 | El sistema debe mostrar el catálogo con imagen, nombre, categoría, atributo, precio, descuento y stock. | EP1–EP3 |
| RF-20 | El catálogo debe obtenerse desde `ms-productos` y permitir búsqueda por texto y filtro por categoría. | EP3 |
| RF-21 | El Home debe mostrar productos destacados y la página Productos el catálogo completo paginado. | EP2 y EP3 |
| RF-22 | Un producto con stock 0 debe mostrarse como "Sin stock" y no debe poder agregarse al carrito. | EP2 y EP3 |
| RF-23 | Debe existir una vista de ofertas con los productos que tienen descuento. | EP2 y EP3 |
| RF-24 | El administrador debe poder crear, editar y eliminar productos; crear responde `201` y eliminar `204`. | EP2 y EP3 |
| RF-25 | El administrador debe poder crear, editar y eliminar categorías, sin duplicar nombres. | EP3 |
| RF-26 | El backend debe exponer el stock crítico (productos con 5 unidades o menos, incluidos los agotados). | EP3 |
| RF-27 | Los cambios de catálogo deben reflejarse de inmediato en el Home, el listado y el panel de administración. | EP2 y EP3 |
| RF-28 | La ruta `/admin` debe estar protegida: un visitante es redirigido al login y un cliente ve un mensaje de acceso denegado. | EP2 y EP3 |

### 4.4 Carrito y cupones

| N.° | Requisito | Etapa |
|---|---|---|
| RF-29 | Un visitante debe poder armar un carrito local; al iniciar sesión, ese carrito debe subirse a `ms-carrito`. | EP3 |
| RF-30 | El cliente autenticado debe poder agregar, actualizar cantidad y eliminar ítems de su carrito. | EP1–EP3 |
| RF-31 | El sistema debe calcular en el servidor subtotal, descuento y total, y devolverlos al frontend. | EP3 |
| RF-32 | El backend debe impedir que un cliente consulte o modifique el carrito de otro usuario, respondiendo `403`. | EP3 |
| RF-33 | Al agregar o actualizar un ítem, el carrito debe validar contra `ms-productos` que el producto exista, esté activo y tenga stock suficiente. | EP3 |
| RF-34 | Si el stock es insuficiente, el backend debe responder `409`; si el producto no existe, `404`. | EP3 |
| RF-35 | Si `ms-productos` no responde, `ms-carrito` debe responder `503` con un mensaje comprensible. | EP3 |
| RF-36 | El sistema debe permitir aplicar y quitar cupones, informando con `400` cuando el código no existe. | EP1–EP3 |
| RF-37 | El carrito vacío debe informar su estado y ofrecer volver al catálogo. | EP1–EP3 |
| RF-38 | El indicador del encabezado debe reflejar la cantidad total de unidades del carrito en todas las páginas. | EP1–EP3 |

### 4.5 Pagos

| N.° | Requisito | Etapa |
|---|---|---|
| RF-39 | El cliente autenticado debe poder registrar un pago indicando orden, monto, método y número de tarjeta cuando corresponda. | EP3 |
| RF-40 | El sistema debe simular el resultado: tarjetas terminadas en `0000` se rechazan por fondos insuficientes, las terminadas en `1111` por tarjeta inválida y el resto se aprueba. | EP3 |
| RF-41 | La transferencia debe aprobarse sin exigir número de tarjeta. | EP3 |
| RF-42 | El registro de pago debe responder `201` incluso cuando el resultado es `RECHAZADO`, informando el estado y el motivo. | EP3 |
| RF-43 | El sistema debe guardar solo los últimos cuatro dígitos de la tarjeta, nunca el número completo. | EP3 |
| RF-44 | El sistema debe impedir más de un pago aprobado para la misma orden, respondiendo `409`. | EP3 |
| RF-45 | El cliente debe poder consultar los pagos de una orden y el administrador el historial completo, con filtro por estado. | EP3 |
| RF-46 | Un cliente que intente ver el historial completo debe recibir `403`. | EP3 |

### 4.6 Integración y operación

| N.° | Requisito | Etapa |
|---|---|---|
| RF-47 | El frontend debe obtener las URLs de las cuatro APIs desde variables de entorno de Vite. | EP3 |
| RF-48 | El frontend debe enviar el JWT en las llamadas protegidas y cerrar la sesión cuando el servidor responda `401`. | EP3 |
| RF-49 | La navegación entre Home, Productos, Categorías, Ofertas, Detalle, Carrito, Checkout, Login, Registro y Admin debe realizarse sin recargar la página. | EP2 y EP3 |
| RF-50 | El sistema debe exponer `/actuator/health` en cada microservicio y documentación Swagger en `/swagger-ui.html`. | EP3 |
| RF-51 | El sistema completo debe desplegarse con un solo comando de Docker Compose en una instancia t3.micro. | EP3 y EFT |
| RF-52 | El sistema debe permitir respaldar y restaurar las cuatro bases de datos mediante un archivo `.sql`. | EFT |

## 5. Requisitos no funcionales

| N.° | Requisito |
|---|---|
| RNF-01 | El frontend debe visualizarse correctamente en Chrome, Edge y Firefox actuales. |
| RNF-02 | La interfaz debe ser responsive en escritorio, tablet y celular. |
| RNF-03 | La comunicación entre frontend y backend debe ser HTTP/JSON, con códigos de estado coherentes (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `503`). |
| RNF-04 | Las contraseñas deben almacenarse con hash BCrypt; nunca en texto plano ni en el frontend. |
| RNF-05 | Los endpoints de escritura de catálogo y la administración de usuarios deben exigir rol `ADMIN`. |
| RNF-06 | El carrito y los pagos deben exigir autenticación y validar la propiedad del recurso. |
| RNF-07 | El JWT debe estar firmado con HMAC-SHA256 y un secreto compartido de al menos 32 caracteres, configurable por variable de entorno. |
| RNF-08 | El backend debe validar la entrada con Bean Validation y responder errores estructurados sin exponer trazas internas. |
| RNF-09 | Cada microservicio debe tener su propia base de datos y no acceder a las tablas de otro servicio. |
| RNF-10 | La comunicación entre servicios debe tener timeout (2–3 segundos) y degradar con `503` cuando el servicio dependiente no esté disponible. |
| RNF-11 | El sistema debe operar en una instancia t3.micro (1 GB de RAM y 2 vCPU) con 1 GB de swap y límites de memoria por contenedor. |
| RNF-12 | El frontend debe compilarse con Vite y servirse como archivos estáticos desde Nginx. |
| RNF-13 | Las imágenes de los servicios deben construirse en dos etapas para no incluir el JDK ni las dependencias de desarrollo en ejecución. |
| RNF-14 | Los contenedores deben reiniciarse automáticamente (`unless-stopped`) y declarar healthchecks. |
| RNF-15 | El backend debe incluir pruebas automatizadas con JUnit, MockMvc y JaCoCo, y el frontend con Jasmine y Karma. |
| RNF-16 | La cobertura de líneas del frontend debe ser al menos 60%; la versión actual alcanza 94,86%. |
| RNF-17 | El código debe estar versionado en Git, con README, ERS, colección Postman y respaldo de base de datos. |
| RNF-18 | La identidad visual (paleta oscura con acentos morados) debe mantenerse coherente en todas las páginas. |

## 6. Reglas de negocio

- **Cupones válidos:** `LEVELUP10` (10%) y `GAMER20` (20%). El descuento se calcula sobre el subtotal en `ms-carrito`; un código inválido responde `400` y no altera el total.
- **Contador del carrito:** cuenta unidades, no líneas. Dos productos con cantidades 2 y 3 muestran 5.
- **Stock:** el stock 0 se considera agotado. `ms-carrito` consulta `ms-productos` antes de agregar o modificar un ítem y responde `409` si no alcanza.
- **Roles:** `CLIENTE` por defecto en el registro público; `ADMIN` solo puede ser asignado por otro administrador o por la siembra inicial.
- **Cuenta administradora:** `admin@levelup.cl` / `Admin123!`, creada automáticamente si no existe.
- **Pagos:** se aprueban salvo que la tarjeta termine en `0000` o `1111`. Una orden no puede tener dos pagos aprobados.
- **Datos de tarjeta:** solo se persisten los últimos cuatro dígitos.
- **Token:** expira a los 120 minutos por defecto; el frontend cierra la sesión ante un `401`.

## 7. Tecnologías utilizadas

**Frontend**

- React 19, Vite 8, React Router 7 y Context API.
- `fetch` nativo centralizado en `src/api/cliente.js`, sin proxy de Vite.
- Bootstrap 5 y hoja de estilos propia.
- Jasmine 7, Karma 6, Testing Library y esbuild como preprocesador.
- Istanbul (`istanbul-lib-instrument`) para la cobertura del código fuente.
- Nginx como servidor estático en producción.

**Backend**

- Java 21 y Spring Boot 4.
- Spring Web MVC, Spring Data JPA, Spring Security y OAuth2 Resource Server (JWT).
- Bean Validation, Actuator, Springdoc OpenAPI y MySQL Connector/J.
- Maven multi-módulo con un módulo `comun` compartido.
- JUnit 5, MockMvc, H2 para pruebas y JaCoCo.

**Infraestructura**

- MySQL 8.4 en contenedor, con cuatro bases independientes.
- Docker y Docker Compose.
- AWS EC2 t3.micro con Amazon Linux 2023.
- Swap de 1 GB y límites de memoria por contenedor.

## 8. Arquitectura

```
                         ┌─────────────────────────────┐
                         │  Navegador (React + Nginx)  │
                         └──────────────┬──────────────┘
                                        │ HTTP/JSON + JWT
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        │               │               │               │               │
   ┌────▼────┐    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐         │
   │ ms-login│    │ms-productos│   │ ms-carrito│   │  ms-pagos │         │
   │  :8081  │    │   :8082    │   │   :8083   │   │   :8085   │         │
   └────┬────┘    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘         │
        │               │               │               │               │
        │               │        ┌──────┘               │               │
        │               │        │ valida stock/precio  │               │
        │               │◄───────┘ (HTTP interno)       │               │
        │               │               │               │               │
   ┌────▼────┐    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐         │
   │ db_login│    │db_productos│   │ db_carrito│   │  db_pagos │         │
   └─────────┘    └───────────┘   └───────────┘   └───────────┘         │
                         MySQL 8.4 (red interna)                        │
```

| Servicio | Responsabilidad | Base de datos | Puerto |
|---|---|---|---|
| `ms-login` | Registro, login, JWT, usuarios y roles | `db_login` | 8081 |
| `ms-productos` | Productos, categorías, ofertas y stock | `db_productos` | 8082 |
| `ms-carrito` | Carrito, ítems, cupones y totales | `db_carrito` | 8083 |
| `ms-pagos` | Registro y consulta de pagos simulados | `db_pagos` | 8085 |
| Frontend | Interfaz React compilada | — | 80 |

## 9. Modelo de datos

### db_login → `usuarios`

| Campo | Tipo | Restricción |
|---|---|---|
| `id` | BIGINT | PK, autoincremental |
| `nombre` | VARCHAR(50) | obligatorio |
| `correo` | VARCHAR(100) | obligatorio, único |
| `password` | VARCHAR(100) | obligatorio, hash BCrypt |
| `telefono` | VARCHAR(20) | opcional |
| `region` | VARCHAR(50) | obligatorio |
| `comuna` | VARCHAR(50) | obligatorio |
| `rol` | ENUM(`ADMIN`,`CLIENTE`) | obligatorio |
| `fecha_registro` | DATETIME(6) | obligatorio |
| `activo` | BIT(1) | obligatorio |

### db_productos → `categorias` y `productos`

| Tabla | Campos principales |
|---|---|
| `categorias` | `id`, `nombre` (único) |
| `productos` | `id`, `nombre`, `categoria_id` (FK), `atributo`, `precio`, `descuento`, `stock`, `imagen`, `activo` |

### db_carrito → `carritos` e `items_carrito`

| Tabla | Campos principales |
|---|---|
| `carritos` | `id`, `usuario_id` (único), `cupon_codigo`, `fecha_actualizacion` |
| `items_carrito` | `id`, `carrito_id` (FK), `producto_id`, `nombre`, `imagen`, `precio_unitario`, `cantidad` |

### db_pagos → `pagos`

| Campo | Tipo | Restricción |
|---|---|---|
| `id` | BIGINT | PK, autoincremental |
| `orden_id` | BIGINT | obligatorio, indexado |
| `monto` | INT | obligatorio, positivo |
| `metodo` | ENUM | `TARJETA_CREDITO`, `TARJETA_DEBITO`, `TRANSFERENCIA` |
| `ultimos_digitos` | VARCHAR(4) | opcional |
| `estado` | ENUM | `APROBADO`, `RECHAZADO` |
| `codigo_transaccion` | VARCHAR(36) | obligatorio, único |
| `motivo_rechazo` | VARCHAR(120) | opcional |
| `fecha` | DATETIME(6) | obligatorio |

## 10. API REST

### ms-login

| Método | Ruta | Acceso | Éxito |
|---|---|---|---|
| POST | `/api/auth/login` | Público | 200 |
| POST | `/api/usuarios/registro` | Público | 201 |
| GET | `/api/usuarios` | ADMIN | 200 |
| GET | `/api/usuarios/{id}` | Autenticado | 200 |
| POST | `/api/usuarios` | ADMIN | 201 |
| PUT | `/api/usuarios/{id}` | Autenticado | 200 |
| DELETE | `/api/usuarios/{id}` | ADMIN | 204 |
| GET | `/api/usuarios/{id}/existe` | Público | 200 |

### ms-productos

| Método | Ruta | Acceso | Éxito |
|---|---|---|---|
| GET | `/api/productos` | Público | 200 |
| GET | `/api/productos/ofertas` | Público | 200 |
| GET | `/api/productos/criticos` | Público | 200 |
| GET | `/api/productos/{id}` | Público | 200 |
| POST | `/api/productos` | ADMIN | 201 |
| PUT | `/api/productos/{id}` | ADMIN | 200 |
| DELETE | `/api/productos/{id}` | ADMIN | 204 |
| POST | `/api/productos/stock/descontar` | Autenticado | 200 |
| POST | `/api/productos/stock/reponer` | Autenticado | 200 |
| GET | `/api/categorias` | Público | 200 |
| POST | `/api/categorias` | ADMIN | 201 |
| PUT | `/api/categorias/{id}` | ADMIN | 200 |
| DELETE | `/api/categorias/{id}` | ADMIN | 204 |

### ms-carrito

| Método | Ruta | Acceso | Éxito |
|---|---|---|---|
| GET | `/api/carritos/{usuarioId}` | Dueño | 200 |
| POST | `/api/carritos/{usuarioId}/items` | Dueño | 200 |
| PUT | `/api/carritos/{usuarioId}/items/{productoId}` | Dueño | 200 |
| DELETE | `/api/carritos/{usuarioId}/items/{productoId}` | Dueño | 204 |
| DELETE | `/api/carritos/{usuarioId}` | Dueño | 204 |
| POST | `/api/carritos/{usuarioId}/cupon` | Dueño | 200 |
| DELETE | `/api/carritos/{usuarioId}/cupon` | Dueño | 200 |

### ms-pagos

| Método | Ruta | Acceso | Éxito |
|---|---|---|---|
| POST | `/api/pagos` | Autenticado | 201 |
| GET | `/api/pagos/orden/{ordenId}` | Autenticado | 200 |
| GET | `/api/pagos/{id}` | Autenticado | 200 |
| GET | `/api/pagos` | ADMIN | 200 |

## 11. Estrategia de pruebas

| Nivel | Herramientas | Alcance | Resultado |
|---|---|---|---|
| Backend `ms-login` | JUnit 5, MockMvc, H2 | Servicios, controladores, seguridad, validaciones | 62 pruebas |
| Backend `ms-productos` | JUnit 5, MockMvc, H2 | CRUD, filtros, stock, seguridad | 57 pruebas |
| Backend `ms-carrito` | JUnit 5, MockMvc, H2, JaCoCo | Ítems, cupones, propiedad, fallback 503 | 42 pruebas, 85,11% líneas |
| Backend `ms-pagos` | JUnit 5, MockMvc, H2, JaCoCo | Reglas de aprobación, duplicados, roles | 31 pruebas, 98,37% líneas |
| Frontend | Jasmine, Karma, Testing Library | Componentes, páginas, contextos e integración con los 4 servicios | 190 pruebas |
| Cobertura frontend | Istanbul + esbuild | Código de `src/` | 94,86% líneas |
| API manual | Postman | 48 peticiones con pruebas automáticas | — |

El detalle del frontend se documenta en [Informe_Cobertura_Testing.md](Informe_Cobertura_Testing.md).

## 12. Despliegue y operación

### Variables de entorno

| Variable | Uso |
|---|---|
| `PUBLIC_HOST` | IP o dominio usado para compilar las URLs del frontend |
| `MYSQL_ROOT_PASSWORD` | Contraseña de root de MySQL |
| `DB_USER` / `DB_PASSWORD` | Credenciales de la aplicación |
| `JWT_SECRET` | Secreto HMAC compartido por los cuatro servicios |
| `JWT_EXPIRATION_MINUTES` | Vigencia del token (120 por defecto) |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma |
| `VITE_API_LOGIN`, `VITE_API_PRODUCTOS`, `VITE_API_CARRITO`, `VITE_API_PAGOS` | URLs de las APIs usadas al compilar el frontend |

### Puertos públicos

| Puerto | Servicio |
|---|---|
| 22 | SSH (solo para administración) |
| 80 | Frontend |
| 8081 | ms-login |
| 8082 | ms-productos |
| 8083 | ms-carrito |
| 8085 | ms-pagos |

MySQL no publica puertos: solo es accesible desde la red interna de Docker.

### Recursos en t3.micro

| Contenedor | Límite de memoria | JVM |
|---|---|---|
| MySQL | 320 MB | — |
| ms-login | 360 MB | `-Xmx112m`, MetaSpace 160 MB, SerialGC |
| ms-productos | 360 MB | `-Xmx112m`, MetaSpace 160 MB, SerialGC |
| ms-carrito | 360 MB | `-Xmx112m`, MetaSpace 160 MB, SerialGC |
| ms-pagos | 360 MB | `-Xmx112m`, MetaSpace 160 MB, SerialGC |
| Frontend | 64 MB | Nginx |

El swap de 1 GB absorbe los picos de arranque de las cuatro JVM. Es un ajuste técnico de la instancia, no un componente de la aplicación.

## 13. Limitaciones conocidas

- El checkout usa un `ordenId` simbólico (`Date.now()`) porque no existe un microservicio de órdenes en el alcance.
- `ms-carrito` no descuenta stock; solo valida disponibilidad. El descuento real de stock queda fuera del alcance.
- `ms-pagos` es una simulación: no se conecta a un proveedor real ni confirma la transacción con un banco.
- Los cuatro microservicios comparten una sola instancia y un solo MySQL; no hay alta disponibilidad.
- El frontend compila las URLs de las APIs, por lo que un cambio de dominio exige recompilar la imagen.
- El formulario de boletín del pie de página es solo visual.
- No se implementan correos de confirmación ni recuperación de contraseña.
