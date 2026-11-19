# Level-Up Gamer 🎮

Tienda online de productos para gamers, desarrollada para el ramo **DSY1104 – Desarrollo Fullstack II** (Duoc UC).

El repositorio reúne las tres etapas del ramo:

| Carpeta | Evaluación | Tecnologías |
|---|---|---|
| Raíz (`index.html`, `registro.html`, `login.html`, `carrito.html`, `assets/`) | Evaluación Formativa N.° 1 | HTML5, CSS3, Bootstrap, JavaScript |
| `level-up-react/` | Evaluación Parcial N.° 2 | React, Vite, React Router, Context API |
| `backend/` + `level-up-react/` | **EP3 y EFT** | Spring Boot 4, MySQL 8, JWT, Docker, Nginx |

La versión actual es una aplicación **fullstack real**: el frontend React consume cuatro microservicios Spring Boot a través de HTTP, con autenticación JWT, roles y persistencia en MySQL.

---

## Arquitectura

```
Navegador
   │
   ├── :80    frontend React (Nginx, compilado con Vite)
   │
   ├── :8081  ms-login      → login, JWT, usuarios y roles   → db_login
   ├── :8082  ms-productos  → catálogo, categorías y stock   → db_productos
   ├── :8083  ms-carrito    → carrito, ítems y cupones       → db_carrito
   └── :8085  ms-pagos      → simulación de cobros           → db_pagos
                                   │
                              MySQL 8.4 (red interna)
```

- **Frontend:** React 19 + Vite + React Router + Context API. Las URLs de cada API se leen de `VITE_API_LOGIN`, `VITE_API_PRODUCTOS`, `VITE_API_CARRITO` y `VITE_API_PAGOS`.
- **Backend:** Spring Boot 4, Spring Security con JWT, Spring Data JPA, Bean Validation, Actuator y Swagger/OpenAPI.
- **Base de datos:** una instancia MySQL con cuatro bases independientes, una por servicio.
- **Despliegue:** Docker Compose sobre una única instancia **t3.micro** con 1 GB de swap.

### Puertos y documentación de cada servicio

| Servicio | Puerto | Health | Swagger |
|---|---|---|---|
| ms-login | 8081 | `/actuator/health` | `/swagger-ui.html` |
| ms-productos | 8082 | `/actuator/health` | `/swagger-ui.html` |
| ms-carrito | 8083 | `/actuator/health` | `/swagger-ui.html` |
| ms-pagos | 8085 | `/actuator/health` | `/swagger-ui.html` |

---

## Cómo levantar el proyecto completo con Docker

Requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) con Docker Compose.

```bash
cd backend
cp .env.prod.example .env
# Editar .env: PUBLIC_HOST, MYSQL_ROOT_PASSWORD y JWT_SECRET
docker compose -f docker-compose.prod.yml up -d --build
```

Luego abrir **http://localhost/** (o `http://PUBLIC_HOST/` si se cambió la variable).

Para revisar el estado:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100
```

Para detener sin borrar datos:

```bash
docker compose -f docker-compose.prod.yml down
```

Para borrar también la base de datos (reinicia el catálogo y los usuarios):

```bash
docker compose -f docker-compose.prod.yml down -v
```

> El archivo `backend/docker-compose.yml` queda disponible para levantar **solo MySQL** durante el desarrollo.

---

## Desarrollo local sin contenedores para el backend

1. Levantar MySQL:

```bash
cd backend
docker compose up -d
```

2. Compilar los módulos (requiere JDK 21):

```bash
cd backend
./mvnw -DskipTests package
```

3. Ejecutar cada microservicio en una terminal distinta:

```bash
java -jar ms-login/target/ms-login-1.0.0.jar
java -jar ms-productos/target/ms-productos-1.0.0.jar
java -jar ms-carrito/target/ms-carrito-1.0.0.jar
java -jar ms-pagos/target/ms-pagos-1.0.0.jar
```

4. Levantar el frontend:

```bash
cd level-up-react
npm install
npm run dev
```

Abrir **http://localhost:5173**. Vite no usa proxy: el navegador llama directamente a los puertos 8081, 8082, 8083 y 8085, por eso el backend permite CORS desde `http://localhost:5173`.

---

## Cuentas, cupones y tarjetas de prueba

### Copiar y pegar para la demo en vivo

```text
===== ADMIN (CRUD de productos y usuarios) =====
Correo: admin@levelup.cl
Clave:  Admin123!
Rol:    ADMIN

===== CLIENTE NORMAL (carrito, cupones y pagos) =====
Correo: cliente.pagos@levelup.cl
Clave:  Cliente123!
Rol:    CLIENTE
```

**Ambas cuentas se crean automáticamente** al iniciar `ms-login`, incluso en una base de datos vacía. No hay que registrar nada a mano ni importar el respaldo.

| Dato | Valor |
|---|---|
| Cupón 10% | `LEVELUP10` |
| Cupón 20% | `GAMER20` |
| Tarjeta aprobada | cualquier número que **no** termine en `0000` ni `1111`, por ejemplo `4111 1111 1111 4444` |
| Fondos insuficientes | terminación `0000` |
| Tarjeta rechazada | terminación `1111` |
| Transferencia | se aprueba sin número de tarjeta |

---

## Roles y permisos

| Acción | Público | CLIENTE | ADMIN |
|---|---|---|---|
| Ver catálogo y categorías | ✅ | ✅ | ✅ |
| Registrarse e iniciar sesión | ✅ | — | — |
| Gestionar su propio carrito | — | ✅ | ✅ |
| Registrar un pago | — | ✅ | ✅ |
| Ver el historial completo de pagos | — | — | ✅ |
| Crear, editar y eliminar productos o categorías | — | — | ✅ |
| Listar, crear y eliminar usuarios | — | — | ✅ |
| Editar su propio perfil | — | ✅ | ✅ |

Los errores usan códigos HTTP reales: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409` y `503` (cuando `ms-carrito` no puede contactar a `ms-productos`).

---

## Endpoints principales

### ms-login (8081)

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/login` | Público |
| POST | `/api/usuarios/registro` | Público |
| GET | `/api/usuarios` | ADMIN |
| GET | `/api/usuarios/{id}` | Autenticado |
| POST | `/api/usuarios` | ADMIN |
| PUT | `/api/usuarios/{id}` | Autenticado (rol/estado solo ADMIN) |
| DELETE | `/api/usuarios/{id}` | ADMIN |
| GET | `/api/usuarios/{id}/existe` | Público |

### ms-productos (8082)

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/productos` (paginado, filtros `q`, `categoriaId`, `page`, `size`) | Público |
| GET | `/api/productos/ofertas` | Público |
| GET | `/api/productos/criticos` | Público |
| GET | `/api/productos/{id}` | Público |
| POST / PUT / DELETE | `/api/productos`, `/api/productos/{id}` | ADMIN |
| POST | `/api/productos/stock/descontar` y `/stock/reponer` | Autenticado |
| GET | `/api/categorias` | Público |
| POST / PUT / DELETE | `/api/categorias` | ADMIN |

### ms-carrito (8083)

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/carritos/{usuarioId}` | Dueño del carrito |
| POST | `/api/carritos/{usuarioId}/items` | Dueño del carrito |
| PUT | `/api/carritos/{usuarioId}/items/{productoId}` | Dueño del carrito |
| DELETE | `/api/carritos/{usuarioId}/items/{productoId}` | Dueño del carrito |
| DELETE | `/api/carritos/{usuarioId}` | Dueño del carrito |
| POST / DELETE | `/api/carritos/{usuarioId}/cupon` | Dueño del carrito |

### ms-pagos (8085)

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/pagos` | Autenticado |
| GET | `/api/pagos/orden/{ordenId}` | Autenticado |
| GET | `/api/pagos/{id}` | Autenticado |
| GET | `/api/pagos` | ADMIN |

`POST /api/pagos` responde **201** incluso cuando el pago queda `RECHAZADO`; el resultado se informa en el campo `estado`. Solo se guardan los últimos cuatro dígitos de la tarjeta.

---

## Pruebas y cobertura

### Backend

Cada microservicio tiene pruebas unitarias y de integración con JUnit 5, MockMvc y JaCoCo.

| Módulo | Pruebas | Cobertura de líneas |
|---|---|---|
| ms-login | 62 | — |
| ms-productos | 57 | — |
| ms-carrito | 42 | 85,11% |
| ms-pagos | 31 | 98,37% |
| **Total** | **192** | — |

Ejecutar todo:

```bash
cd backend
./mvnw test
```

Ejecutar un módulo con su reporte de cobertura:

```bash
./mvnw -pl ms-pagos -am verify
# reporte en ms-pagos/target/site/jacoco/index.html
```

### Frontend

Las pruebas usan **Jasmine + Karma** con navegador real (Edge o Chrome headless) y Testing Library.

| Comando | Qué hace |
|---|---|
| `npm test` | Ejecuta las 190 pruebas una vez |
| `npm run test:watch` | Ejecuta en modo observación |
| `npm run test:coverage` | Ejecuta y genera cobertura en `coverage/html/index.html` |
| `npm run lint` | Revisa el código con oxlint |
| `npm run build` | Compila la versión de producción |

Resultado actual: **190 pruebas exitosas** y **94,86% de cobertura de líneas** (94,05% sentencias, 86,03% ramas, 94,24% funciones). El detalle está en [Informe_Cobertura_Testing.md](Informe_Cobertura_Testing.md).

---

## Colección Postman

El archivo [entregables/LevelUp_Gamer.postman_collection.json](entregables/LevelUp_Gamer.postman_collection.json) contiene **48 peticiones** organizadas en:

1. Autenticación (login admin, registro y login de cliente, error 401).
2. Usuarios (listado, detalle, creación, actualización, 401, 403 y eliminación).
3. Productos (catálogo, ofertas, stock crítico, CRUD y stock).
4. Categorías (listado y CRUD).
5. Carrito (agregar, actualizar, cupones, 400, 401, 403 y vaciado).
6. Pagos (aprobado, rechazado, fondos insuficientes, transferencia, 400 y 403).
7. Salud de los cuatro servicios.

Cada petición incluye pruebas automáticas (`pm.test`) de código HTTP y contenido. Las variables `token`, `clienteToken`, `clienteId`, `productoId` y `categoriaId` se completan solas al ejecutar la colección en orden.

> En Postman, el tipo de autorización es **Bearer Token** y el valor es solo el token, sin la palabra `Bearer`.

---

## Despliegue en AWS EC2 (t3.micro)

**URL pública de la demo:** **http://184.72.249.146/**

La guía completa está en [GUIA_DESPLIEGUE_EC2.md](GUIA_DESPLIEGUE_EC2.md). Resumen:

1. Instancia **t3.micro** con Amazon Linux 2023 y Elastic IP `184.72.249.146`.
2. Security Group (inbound): **80, 8081, 8082, 8083 y 8085** desde `0.0.0.0/0`. MySQL **3306 no se abre**. SSH 22 solo desde tu IP (opcional).
3. Conectar con **EC2 → Instancia → Connect → Session Manager** (no se usa la llave `.pem`). Requiere un rol IAM con `AmazonSSMManagedInstanceCore`.
4. Instalar Docker, Compose y Git, o ejecutar `sudo bash backend/scripts/preparar-ec2.sh`, que además crea un swap de 1 GB para la t3.micro.
5. Clonar y configurar desde la **raíz** del repo:

```bash
cd ~
git clone https://github.com/Tomas-Torres/fullstack2.git
cd fullstack2
cp .env.example .env
nano .env
# PUBLIC_HOST=184.72.249.146
```

6. Levantar todo con un solo comando:

```bash
docker compose up -d --build
```

7. Verificar:

```bash
docker compose ps
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health
curl http://localhost:8085/actuator/health
```

> El `PUBLIC_HOST` del `.env` debe ser la IP elástica, no `localhost`: el frontend compila las URLs de los cuatro microservicios dentro del bundle. Si cambias la IP, edita `.env` y vuelve a ejecutar `docker compose up -d --build`.

---

## Respaldo de la base de datos

El archivo [entregables/backup_levelup.sql](entregables/backup_levelup.sql) contiene la estructura y los datos de `db_login`, `db_productos`, `db_carrito` y `db_pagos`.

Para restaurarlo en un MySQL limpio:

```bash
docker exec -i levelup-mysql mysql -uroot -p < entregables/backup_levelup.sql
```

Para generar uno nuevo:

```bash
docker exec -e MYSQL_PWD=levelup levelup-mysql \
  mysqldump -ulevelup --databases db_login db_productos db_carrito db_pagos \
  --single-transaction --no-tablespaces --routines --triggers \
  > entregables/backup_levelup.sql
```

---

## Estructura del repositorio

```
fullstack2/
├── docker-compose.yml             → stack completo (se ejecuta desde la raíz)
├── .env.example                   → PUBLIC_HOST=184.72.249.146 y variables
├── .gitignore                     → ignora el .env real
├── GUIA_DESPLIEGUE_EC2.md         → guía adaptada a Session Manager
├── backend/
│   ├── comun/                     → código compartido (JWT, errores, seguridad)
│   ├── ms-login/                  → autenticación y usuarios
│   │   ├── Dockerfile             → imagen del microservicio
│   │   └── src/.../DataInitializer.java → siembra admin + cliente
│   ├── ms-productos/              → catálogo, categorías y stock
│   │   └── Dockerfile             → imagen del microservicio
│   ├── ms-carrito/                → carrito y cupones
│   │   └── Dockerfile             → imagen del microservicio
│   ├── ms-pagos/                  → simulación de pagos
│   │   └── Dockerfile             → imagen del microservicio
│   ├── db/init.sql                → creación de las cuatro bases
│   ├── Dockerfile                 → imagen multi-stage reutilizable
│   ├── docker-compose.yml         → MySQL para desarrollo
│   ├── docker-compose.prod.yml    → stack completo de producción
│   ├── scripts/preparar-ec2.sh    → swap + Docker en Amazon Linux
│   ├── scripts/desplegar.sh       → build, arranque y verificación
│   ├── .env.example               → variables para desarrollo
│   └── .env.prod.example          → variables para producción
├── level-up-react/
│   ├── src/
│   │   ├── api/                   → cliente HTTP y mapeo de respuestas
│   │   ├── components/            → Header, Footer, ProductCard, Campo, RutaAdmin
│   │   ├── context/               → AuthContext, ProductosContext, CarritoContext
│   │   ├── data/                  → regiones y catálogo de respaldo
│   │   ├── pages/                 → Home, Productos, Categorias, Ofertas,
│   │   │                            ProductoDetalle, Carrito, Checkout,
│   │   │                            CompraExitosa, CompraFallida, Login,
│   │   │                            Registro, Admin
│   │   ├── utils/                 → precios.js
│   │   ├── App.jsx                → rutas
│   │   └── main.jsx               → punto de entrada y proveedores
│   ├── tests/                     → 190 pruebas Jasmine/Karma
│   ├── Dockerfile                 → build con Vite + Nginx
│   ├── nginx.conf                 → servidor estático con fallback de rutas
│   ├── karma.conf.cjs
│   └── karma.pp.cjs               → preprocesador esbuild + cobertura
├── entregables/
│   ├── backup_levelup.sql
│   ├── LevelUp_Gamer.postman_collection.json
│   └── evidencia/                 → capturas y salidas de ejecución
├── ERS.md
├── Informe_Cobertura_Testing.md
└── README.md
```

---

## Limitaciones conocidas

- `ms-carrito` no descuenta stock al agregar productos; valida disponibilidad contra `ms-productos` y el descuento real ocurre en el flujo de pago, que en esta versión es una simulación.
- El checkout usa un `ordenId` simbólico (`Date.now()`) porque el alcance de la EP3/EFT no incluye un microservicio de órdenes.
- `ms-pagos` no se comunica con un proveedor real de pagos: clasifica el resultado según la terminación de la tarjeta.
- El número de tarjeta nunca se guarda completo; solo los últimos cuatro dígitos.
- Todo el stack corre en una sola instancia t3.micro con swap, pensado para la entrega académica y no para producción real.

---

## Evidencias

La carpeta `entregables/evidencia/` contiene:

- `ejecucion-npm-test.txt`: resultado de las 190 pruebas del frontend.
- `ejecucion-test-coverage.txt`: resumen de cobertura de Istanbul.
- `ejecucion-mvn-test.txt`: salida de las 192 pruebas del backend.
- `verificacion-backend.txt`: health de los cuatro servicios, login real de admin y cliente, y flujo catálogo → carrito → cupón → pago.
- `cobertura-resumen.png`: captura del reporte HTML de cobertura.
- `demo-frontend.png`: captura de la tienda servida por Nginx.

## Documentación

- [GUIA_DESPLIEGUE_EC2.md](GUIA_DESPLIEGUE_EC2.md): despliegue en la EC2 con Session Manager y la IP `184.72.249.146`.
- [ERS.md](ERS.md): especificación de requisitos, arquitectura, endpoints y requisitos no funcionales.
- [Informe_Cobertura_Testing.md](Informe_Cobertura_Testing.md): metodología, resultados y anexos de configuración de las pruebas.

## Autor

Tomás Torres Delgado
