# ms-productos

Microservicio de catalogo de **Level-Up Gamer**. Administra productos, categorias y
stock sobre MySQL, expone una API REST documentada con Swagger y valida los JWT
emitidos por `ms-login`.

- Puerto por defecto: **8082**
- Base de datos: **db_productos**
- Documentacion interactiva: <http://localhost:8082/swagger-ui.html>
- OpenAPI JSON: <http://localhost:8082/v3/api-docs>

---

## 1. Requisitos

| Herramienta | Version usada |
|---|---|
| JDK | 21 |
| Maven | wrapper incluido (`mvnw.cmd`) |
| MySQL | 8.4 en Docker |
| Docker Desktop | activo |

Todo se ejecuta desde `fullstack2/backend`.

---

## 2. Levantar MySQL

```powershell
docker compose up -d
docker exec levelup-mysql mysql -uroot -proot -e "SHOW DATABASES;"
```

Debe aparecer `db_productos` (junto a `db_login`, `db_pagos` y
`levelup_reportes`). El usuario de la aplicacion es `levelup` / `levelup`.

> Si el volumen se creo antes del renombre del schema, ejecutar
> `docker compose down -v` y luego `docker compose up -d` (borra los datos locales).

---

## 3. Ejecutar el microservicio

Compilar el proyecto una vez (instala `comun` en el repositorio local):

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
.\mvnw.cmd -DskipTests install
```

Opcion A, con el jar (la mas simple):

```powershell
java -jar ms-productos\target\ms-productos-1.0.0.jar
```

Opcion B, desde el codigo:

```powershell
.\mvnw.cmd -pl ms-productos spring-boot:run
```

Al arrancar por primera vez, `DataInitializer` crea **6 categorias** y **8 productos**
si las tablas estan vacias. Verificar:

```powershell
curl.exe -s http://localhost:8082/api/productos
```

---

## 4. Obtener un token para probar rutas protegidas

Con `ms-login` operativo en el puerto 8081, iniciar sesion con el administrador
inicial:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/auth/login `
  -ContentType "application/json" `
  -Body '{"correo":"admin@levelup.cl","password":"Admin123!"}'

$admin = $login.token
```

Si `ms-login` no esta disponible, usar el script local incluido:

```powershell
# Token ADMIN valido por 2 horas
$admin = .\scripts\generar-token.ps1 -Rol ADMIN

# Token CLIENTE valido por 2 horas
$cliente = .\scripts\generar-token.ps1 -Rol CLIENTE -Subject cliente@levelup.cl
```

El script firma un JWT HS256 con el mismo secreto por defecto del backend
(`levelup-gamer-dev-secret-key-change-in-production-2026`). Si se cambia
`JWT_SECRET`, pasar el nuevo valor con `-Secret`.

En **Postman**: pestaña *Authorization* -> tipo *Bearer Token* -> pegar el token.
En **Swagger**: boton *Authorize* -> pegar solo el token (sin la palabra `Bearer`).

---

## 5. Endpoints

### Publicos (sin token)

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/productos` | Lista productos activos (array plano) |
| GET | `/api/productos?q=&categoriaId=&oferta=&sinStock=` | Filtros combinables |
| GET | `/api/productos?page=0&size=5` | Paginacion (objeto `PageResponse`) |
| GET | `/api/productos/{id}` | Detalle; 404 si no existe o esta inactivo |
| GET | `/api/productos/ofertas` | Productos con descuento > 0 |
| GET | `/api/productos/criticos?umbral=5` | Stock <= umbral (por defecto 5) |
| GET | `/api/categorias` | Categorias con cantidad de productos activos |
| GET | `/api/categorias/{id}` | Detalle de categoria |
| GET | `/swagger-ui.html`, `/v3/api-docs` | Documentacion |
| GET | `/actuator/health` | Estado del servicio |

### Solo ADMIN (token con `rol = ADMIN`)

| Metodo | Ruta | Codigos esperados |
|---|---|---|
| POST | `/api/productos` | 201 + `Location`; 400 datos invalidos |
| PUT | `/api/productos/{id}` | 200; 400; 404 |
| DELETE | `/api/productos/{id}` | 204 (baja logica); 404 |
| POST | `/api/categorias` | 201; 409 nombre duplicado |
| PUT | `/api/categorias/{id}` | 200; 404; 409 |
| DELETE | `/api/categorias/{id}` | 204; 409 si tiene productos |

### Autenticados (ADMIN o CLIENTE)

| Metodo | Ruta | Descripcion |
|---|---|---|
| POST | `/api/productos/stock/descontar` | Descuenta stock (uso interno de `ms-pagos`) |
| POST | `/api/productos/stock/reponer` | Repone stock (cancelaciones) |

Cuerpo de los ajustes de stock:

```json
[
  { "productoId": 1, "cantidad": 2 },
  { "productoId": 3, "cantidad": 1 }
]
```

La operacion es **todo o nada**: si un producto no tiene stock suficiente responde
**409** y no modifica ningun registro.

### Codigos de error

| Codigo | Cuando |
|---|---|
| 400 | Validacion, JSON malformado, categoria inexistente, paginacion invalida |
| 401 | Falta el token o la firma es invalida |
| 403 | El token no tiene el rol requerido |
| 404 | Producto o categoria inexistente (o producto dado de baja) |
| 409 | Stock insuficiente, categoria duplicada o categoria con productos |

Formato uniforme:

```json
{
  "timestamp": "2026-11-14T04:45:50.943",
  "status": 409,
  "error": "Conflict",
  "message": "No se puede ajustar el stock del producto 5: stock insuficiente (disponible 0, solicitado 1)",
  "detalles": { "productoId": "5", "disponible": "0", "solicitado": "1" }
}
```

---

## 6. Catalogo inicial

| # | Producto | Categoria | Precio | Desc. | Stock |
|---|---|---|---|---|---|
| 1 | Catan | Juegos de Mesa | 29.990 | 0% | 10 |
| 2 | Carcassonne | Juegos de Mesa | 24.990 | 15% | 10 |
| 3 | Controlador Xbox Series X | Accesorios | 59.990 | 0% | 10 |
| 4 | Audifonos HyperX Cloud II | Accesorios | 79.990 | 20% | 10 |
| 5 | GTA6 (Version Digital) | Videojuegos | 429.990 | 0% | 0 |
| 6 | PC Gamer ASUS ROG Strix | Computadores Gamers | 1.299.990 | 0% | 5 |
| 7 | Silla Gamer Secretlab Titan | Sillas Gamers | 349.990 | 0% | 5 |
| 8 | Mouse Logitech G502 HERO | Mouse | 49.990 | 10% | 10 |

Resultados esperados:

- `GET /api/productos` -> **8** productos
- `GET /api/productos/ofertas` -> **3** (Carcassonne, HyperX, G502)
- `GET /api/productos/criticos` -> **3** (GTA6 stock 0, PC y silla stock 5)
- `GET /api/productos?q=hyperx` -> **1** con `precioFinal = 63992`
- `GET /api/categorias` -> **6** categorias

---

## 7. Pruebas manuales con Postman

1. Crear una coleccion llamada `Level-Up - ms-productos`.
2. Variable de coleccion `baseUrl = http://localhost:8082`.
3. Variable `token` con el `token` devuelto por `ms-login` (o por el script local).
4. En la coleccion, *Authorization* -> *Bearer Token* -> `{{token}}`.
5. Crear las siguientes requests:

| # | Metodo | URL | Verificar |
|---|---|---|---|
| 1 | GET | `{{baseUrl}}/api/productos` | 200 y 8 elementos |
| 2 | GET | `{{baseUrl}}/api/productos?q=hyperx` | 200 y 1 elemento |
| 3 | GET | `{{baseUrl}}/api/productos?oferta=true` | 200 y 3 elementos |
| 4 | GET | `{{baseUrl}}/api/productos?page=0&size=3` | 200, `content` de 3 y `totalPages` 3 |
| 5 | GET | `{{baseUrl}}/api/productos/999999` | 404 |
| 6 | POST | `{{baseUrl}}/api/productos` | 201 (usa el JSON de abajo) |
| 7 | POST | `{{baseUrl}}/api/productos` sin token | 401 |
| 8 | POST | `{{baseUrl}}/api/productos` con token CLIENTE | 403 |
| 9 | POST | `{{baseUrl}}/api/categorias` con `{"nombre":"Mouse"}` | 409 |
| 10 | DELETE | `{{baseUrl}}/api/categorias/2` | 409 (tiene productos) |
| 11 | DELETE | `{{baseUrl}}/api/productos/{idCreado}` | 204 y luego GET -> 404 |
| 12 | GET | `{{baseUrl}}/swagger-ui.html` | Abre Swagger UI |

JSON para crear producto (categoria `6` = Mouse):

```json
{
  "nombre": "Producto de prueba",
  "categoriaId": 6,
  "atributo": "Inalambrico",
  "precio": 19990,
  "descuento": 10,
  "stock": 4,
  "imagen": "/img/nuevo.png"
}
```

Respuesta esperada (201):

```json
{
  "id": 9,
  "nombre": "Producto de prueba",
  "categoriaId": 6,
  "categoriaNombre": "Mouse",
  "atributo": "Inalambrico",
  "precio": 19990,
  "descuento": 10,
  "precioFinal": 17991,
  "stock": 4,
  "imagen": "/img/nuevo.png",
  "activo": true,
  "enOferta": true,
  "sinStock": false
}
```

### Prueba rapida por consola

```powershell
$base = "http://localhost:8082"
$admin = (Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/auth/login `
  -ContentType "application/json" `
  -Body '{"correo":"admin@levelup.cl","password":"Admin123!"}').token

# Publico
curl.exe -s "$base/api/productos"

# Crear (guardar el JSON en un archivo evita problemas de comillas)
@'
{"nombre":"Producto de prueba","categoriaId":6,"atributo":"Inalambrico","precio":19990,
 "descuento":10,"stock":4,"imagen":"/img/nuevo.png"}
'@ | Set-Content -Path nuevo.json -Encoding UTF8

curl.exe -s -X POST "$base/api/productos" `
  -H "Authorization: Bearer $admin" `
  -H "Content-Type: application/json" `
  --data-binary "@nuevo.json"

# Sin token -> 401
curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/api/productos"
```

---

## 8. Pruebas automatizadas y cobertura

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
.\mvnw.cmd -pl ms-productos -am verify
```

- **57 pruebas** (servicios, stock transaccional, API completa con MockMvc).
- Las pruebas usan H2 en memoria y no tocan MySQL.
- JaCoCo exige **>= 60%** de lineas; el reporte actual esta en
  `ms-productos/target/site/jacoco/index.html`.
- Cobertura obtenida: **98% de lineas (352/359)**.

Si se quiere revisar el reporte:

```powershell
start ms-productos\target\site\jacoco\index.html
```

---

## 9. Variables de entorno

| Variable | Default |
|---|---|
| `SERVER_PORT` | `8082` |
| `DB_URL` | `jdbc:mysql://localhost:3306/db_productos?...` |
| `DB_USER` | `levelup` |
| `DB_PASSWORD` | `levelup` |
| `JWT_SECRET` | `levelup-gamer-dev-secret-key-change-in-production-2026` |
| `JWT_EXPIRATION_MINUTES` | `120` |
| `CORS_ORIGINS` | `http://localhost:5173` |
| `JPA_DDL_AUTO` | `update` |

---

## 10. Problemas frecuentes

| Sintoma | Solucion |
|---|---|
| `Unknown database 'db_productos'` | `docker compose down -v` y `docker compose up -d` |
| `Access denied for user 'levelup'` | Esperar a que MySQL termine de inicializar; revisar `docker logs levelup-mysql` |
| 401 en todas las rutas protegidas | Renovar el token; verificar que `JWT_SECRET` sea el mismo |
| 403 con token ADMIN | El claim debe llamarse `rol` y valer `ADMIN` |
| Puerto 8082 ocupado | `SERVER_PORT=8092` o detener el proceso anterior |
| Swagger responde 401 | Usar el token en *Authorize* o abrir `/swagger-ui.html` sin seguridad adicional |
