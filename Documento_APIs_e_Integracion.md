# Documento de APIs e Integración

**Proyecto:** Level-Up Gamer  
**Versión:** 3.0  
**Evaluación:** EP3 + Evaluación Final de Taller, DSY1104  
**Fecha:** Noviembre 2026

## 1. Objetivo

Este documento explica cómo se comunican el frontend React y los cuatro microservicios Spring Boot, qué endpoints se usan, cómo se gestiona el JWT y cómo se verifica la integración en el despliegue de AWS.

---

## 2. Organización del repositorio

El código está en un único repositorio público:

```text
https://github.com/Tomas-Torres/fullstack2
```

Es un **monorepo**: en el mismo repo conviven el frontend y el backend. Esto **no** significa que el backend sea un monolito; cada microservicio se compila y se ejecuta como una aplicación Spring Boot independiente, con su propio puerto, su contenedor y su base de datos.

```text
fullstack2/
├── index.html, login.html, registro.html, carrito.html, assets/  → EP1
├── level-up-react/                                               → Frontend React
├── backend/
│   ├── comun/            → filtro JWT y configuración compartida
│   ├── db/               → init.sql con las cuatro bases
│   ├── ms-login/         → 8081
│   ├── ms-productos/     → 8082
│   ├── ms-carrito/       → 8083
│   └── ms-pagos/         → 8085
├── docker-compose.yml
├── entregables/
└── ERS.md, README.md, Informe_Cobertura_Testing.md, Manual_Usuario.md
```

---

## 3. Arquitectura de ejecución

```text
Navegador
   │
   ├── http://184.72.249.146/            → Nginx → bundle React (Vite)
   │
   ├── :8081  ms-login      → JWT, usuarios y roles      → db_login
   ├── :8082  ms-productos  → catálogo, categorías, stock→ db_productos
   ├── :8083  ms-carrito    → carrito, ítems y cupones   → db_carrito
   └── :8085  ms-pagos      → simulación de cobros       → db_pagos
                                   │
                              MySQL 8.4 (red interna)
```

| Servicio | Puerto | Base de datos | Health | Swagger |
|---|---:|---|---|---|
| Frontend | 80 | — | — | — |
| `ms-login` | 8081 | `db_login` | `/actuator/health` | `/swagger-ui.html` |
| `ms-productos` | 8082 | `db_productos` | `/actuator/health` | `/swagger-ui.html` |
| `ms-carrito` | 8083 | `db_carrito` | `/actuator/health` | `/swagger-ui.html` |
| `ms-pagos` | 8085 | `db_pagos` | `/actuator/health` | `/swagger-ui.html` |

MySQL no se expone al exterior: solo se accede desde la red interna de Docker Compose.

---

## 4. Variables de entorno

### 4.1 Frontend

El cliente HTTP está centralizado en `level-up-react/src/api/cliente.js` y usa `fetch` nativo:

```text
VITE_API_LOGIN      → http://PUBLIC_HOST:8081
VITE_API_PRODUCTOS  → http://PUBLIC_HOST:8082
VITE_API_CARRITO    → http://PUBLIC_HOST:8083
VITE_API_PAGOS      → http://PUBLIC_HOST:8085
```

Vite reemplaza estas variables **al compilar**, por eso el `docker-compose.yml` las pasa como `build args`:

```yaml
args:
  VITE_API_LOGIN: http://${PUBLIC_HOST}:8081
  VITE_API_PRODUCTOS: http://${PUBLIC_HOST}:8082
  VITE_API_CARRITO: http://${PUBLIC_HOST}:8083
  VITE_API_PAGOS: http://${PUBLIC_HOST}:8085
```

En producción `PUBLIC_HOST=184.72.249.146`. Si se cambiara la IP, hay que recompilar el frontend.

### 4.2 Backend y base de datos

Definidas en `.env.example`:

| Variable | Valor de ejemplo | Uso |
|---|---|---|
| `PUBLIC_HOST` | `184.72.249.146` | IP pública usada en el build y en CORS |
| `MYSQL_ROOT_PASSWORD` | `root` | Usuario root de MySQL |
| `DB_USER` | `levelup` | Usuario de aplicación |
| `DB_PASSWORD` | `levelup` | Debe coincidir con `backend/db/init.sql` |
| `JWT_SECRET` | secreto de 32+ caracteres | Firma HMAC-SHA256 compartida |
| `JWT_EXPIRATION_MINUTES` | `120` | Vigencia del token |
| `CORS_ORIGINS` | IP pública, localhost y 127.0.0.1 | Orígenes autorizados por el navegador |

> El archivo `.env` real no se versiona. Se entrega `.env.example`.

---

## 5. Comunicación frontend → backend

Todas las llamadas siguen el mismo patrón:

1. El componente llama a una función de `src/api/cliente.js`.
2. Se construye la URL con la variable `VITE_API_*` correspondiente.
3. Se agrega `Content-Type: application/json` cuando hay cuerpo.
4. Si hay sesión, se envía `Authorization: Bearer <token>`.
5. Se usa `fetch` con `AbortController` y timeout de 8 segundos.
6. La respuesta se parsea como JSON; `204` devuelve `null`.
7. Si el servidor responde `401`, el frontend cierra la sesión.

El token se guarda en `localStorage`, por lo que la sesión se conserva al recargar la página.

---

## 6. Endpoints consumidos por el frontend

### `ms-login`

| Método | Ruta | Uso en el frontend |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesión |
| POST | `/api/usuarios/registro` | Registro público |
| GET | `/api/usuarios/{id}` | Perfil tras el login |
| GET | `/api/usuarios` | Panel admin |
| POST / PUT / DELETE | `/api/usuarios` | Administración de usuarios |

### `ms-productos`

| Método | Ruta | Uso en el frontend |
|---|---|---|
| GET | `/api/productos` | Home, catálogo, búsqueda y filtros |
| GET | `/api/productos/ofertas` | Página Ofertas |
| GET | `/api/productos/criticos` | Panel admin |
| GET | `/api/productos/{id}` | Detalle de producto |
| POST / PUT / DELETE | `/api/productos` | CRUD del panel admin |
| GET | `/api/categorias` | Menú y filtros |
| POST | `/api/categorias` | Creación automática desde el formulario |
| POST | `/api/productos/stock/descontar` | Ajuste manual de stock |

### `ms-carrito`

| Método | Ruta | Uso en el frontend |
|---|---|---|
| GET | `/api/carritos/{usuarioId}` | Cargar carrito |
| POST | `/api/carritos/{usuarioId}/items` | Agregar producto |
| PUT | `/api/carritos/{usuarioId}/items/{productoId}` | Cambiar cantidad |
| DELETE | `/api/carritos/{usuarioId}/items/{productoId}` | Quitar producto |
| DELETE | `/api/carritos/{usuarioId}` | Vaciar carrito |
| POST / DELETE | `/api/carritos/{usuarioId}/cupon` | Aplicar o quitar cupón |

### `ms-pagos`

| Método | Ruta | Uso en el frontend |
|---|---|---|
| POST | `/api/pagos` | Checkout |
| GET | `/api/pagos/orden/{ordenId}` | Resumen de la compra |
| GET | `/api/pagos` | Historial del administrador |

---

## 7. Flujo completo de integración

### 7.1 Administrador crea un producto

```text
Admin.jsx
  → ProductosContext.agregarProducto()
  → productosApi.crear(token, datos)
  → POST http://184.72.249.146:8082/api/productos
  → ms-productos valida JWT y rol ADMIN
  → INSERT en db_productos
  → respuesta 201 con el producto creado
  → el frontend actualiza el estado y el catálogo
```

Si la categoría no existe, primero se ejecuta `POST /api/categorias`.

### 7.2 Cliente compra

```text
Login → ms-login → token + rol CLIENTE
Carrito → ms-carrito → valida stock contra ms-productos
Cupón → ms-carrito calcula subtotal, descuento y total
Checkout → ms-pagos → resultado APROBADO o RECHAZADO
Respuesta 201 → frontend guarda la orden y vacía el carrito
```

`ms-pagos` clasifica el resultado por la terminación de la tarjeta:

- `0000`: fondos insuficientes;
- `1111`: tarjeta inválida;
- otras: aprobado;
- transferencia: aprobada sin tarjeta.

### 7.3 Consulta del administrador

```text
Admin → GET /api/pagos → historial de db_pagos
```

Un cliente que intente acceder a ese endpoint recibe `403`.

---

## 8. Autenticación y seguridad

- El login lo emite `ms-login` con JWT firmado en **HMAC-SHA256**.
- Los cuatro servicios comparten `JWT_SECRET` y validan el token de forma local; no hay una llamada desde cada microservicio a `ms-login`.
- El filtro `JwtAuthenticationFilter` extrae el claim de rol y lo convierte en una autoridad de Spring Security.
- Registro público → `CLIENTE`. Solo un ADMIN puede crear o promover a ADMIN.
- El carrito y los pagos validan la propiedad del recurso: un usuario no puede usar el `usuarioId` de otro.
- `401` = ausencia de token, token inválido o credenciales incorrectas.
- `403` = token válido pero rol o propiedad insuficiente.
- Vigencia: 120 minutos. No se implementó `refresh token`; al vencer, el frontend cierra la sesión y solicita un nuevo login.

En producción se recomendaría agregar un refresh rotativo en cookie `HttpOnly` y cambiar el secreto por uno gestionado en un servicio de secretos.

---

## 9. Errores y resiliencia

| Situación | Respuesta |
|---|---|
| Producto inexistente en carrito | `404` |
| Stock insuficiente | `409` |
| Correo ya registrado | `409` |
| `ms-productos` sin respuesta desde `ms-carrito` | `503` |
| Datos inválidos | `400` con detalle por campo |
| Eliminación correcta | `204` sin cuerpo |

La comunicación entre servicios usa timeout y degradación controlada con `503`, cumpliendo el requisito no funcional RNF-10 del ERS.

---

## 10. Despliegue y verificación

El stack completo se levanta desde la raíz del repositorio:

```bash
cp .env.example .env
docker compose up -d --build
```

En la EC2 se usa Session Manager y el mismo compose. El frontend queda en:

```text
http://184.72.249.146/
```

Verificación rápida:

```bash
for p in 8081 8082 8083 8085; do
  curl -s http://184.72.249.146:$p/actuator/health
done
```

Cada respuesta debe ser:

```json
{"status":"UP"}
```

---

## 11. Postman y respaldo

- `entregables/LevelUp_Gamer.postman_collection.json`: 48 peticiones con `pm.test`.
- Variables a ajustar: `baseLogin`, `baseProductos`, `baseCarrito` y `basePagos`.
- `entregables/backup_levelup.sql`: estructura y datos de las cuatro bases.
- Restauración:

```bash
docker exec -i levelup-mysql mysql -uroot -p < entregables/backup_levelup.sql
```

---

## 12. Limitaciones

- `ms-carrito` valida stock, pero no lo reserva ni lo descuenta al pagar. El descuento manual existe en `POST /api/productos/stock/descontar`.
- No hay microservicio de órdenes: el `ordenId` del checkout es `Date.now()`.
- `ms-pagos` simula la transacción; no contacta a un proveedor real.
- Solo se persisten los últimos cuatro dígitos de la tarjeta.
- Todo el stack corre en una sola instancia `t3.micro` con 1 GB de swap, pensada para la entrega académica.

---

## 13. Evidencias

| Archivo | Contenido |
|---|---|
| `entregables/evidencia/verificacion-backend.txt` | Health, login admin/cliente, carrito, cupón y pago reales |
| `entregables/evidencia/cobertura-resumen.png` | Captura del reporte de cobertura |
| [Informe_Cobertura_Testing.md](Informe_Cobertura_Testing.md) | Resultado de pruebas y cobertura |
| [Documentacion_APIs_Swagger.md](Documentacion_APIs_Swagger.md) | Guía de Swagger |
