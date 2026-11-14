# ms-login

Microservicio de **autenticacion y usuarios** de Level-Up Gamer. Registra cuentas,
valida credenciales, emite los JWT que consumen los demas microservicios y
administra los perfiles sobre MySQL.

- Puerto por defecto: **8081**
- Base de datos: **db_login**
- Documentacion interactiva: <http://localhost:8081/swagger-ui.html>
- OpenAPI JSON: <http://localhost:8081/v3/api-docs>

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

Debe aparecer `db_login` junto a `db_productos`, `levelup_compras` y
`levelup_reportes`. El usuario de la aplicacion es `levelup` / `levelup`.

> Si el volumen se creo con el nombre antiguo `levelup_auth`, crear la base sin
> borrar las demas:
>
> ```powershell
> docker exec levelup-mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS db_login CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON db_login.* TO 'levelup'@'%'; FLUSH PRIVILEGES;"
> ```
>
> Alternativa destructiva: `docker compose down -v` y luego `docker compose up -d`.

---

## 3. Ejecutar el microservicio

Compilar el proyecto una vez (instala `comun` en el repositorio local):

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
.\mvnw.cmd -DskipTests install
```

Opcion A, con el jar:

```powershell
java -jar ms-login\target\ms-login-1.0.0.jar
```

Opcion B, desde el codigo:

```powershell
.\mvnw.cmd -pl ms-login spring-boot:run
```

Al arrancar por primera vez, `DataInitializer` crea el administrador si no existe:

| Correo | Contrasena | Rol |
|---|---|---|
| `admin@levelup.cl` | `Admin123!` | ADMIN |

No se crean clientes de prueba: se registran por la API publica.

Comprobar el estado:

```powershell
curl.exe -s http://localhost:8081/actuator/health
```

---

## 4. Como funciona el JWT

`POST /api/auth/login` devuelve un token **HS256** firmado con `JWT_SECRET`
(por defecto `levelup-gamer-dev-secret-key-change-in-production-2026`) y valido
por **2 horas**.

Claims incluidos:

| Claim | Contenido |
|---|---|
| `sub` | correo del usuario |
| `id` | id numerico del usuario |
| `correo` | correo del usuario |
| `rol` | `CLIENTE` o `ADMIN` |
| `iss` | `ms-login` |
| `iat` / `exp` | emision y expiracion |

Los demas microservicios validan la firma con el mismo secreto y usan el claim
`rol` como autoridad `ROLE_ADMIN` / `ROLE_CLIENTE`.

En **Postman**: pestana *Authorization* -> tipo *Bearer Token* -> pegar el token.
En **Swagger**: boton *Authorize* -> pegar solo el token (sin la palabra `Bearer`).

---

## 5. Endpoints

### Publicos (sin token)

| Metodo | Ruta | Descripcion | Codigo |
|---|---|---|---|
| POST | `/api/usuarios/registro` | Registro publico con rol CLIENTE | 201 |
| POST | `/api/auth/login` | Valida credenciales y devuelve el JWT | 200 |
| GET | `/api/usuarios/{id}/existe` | 200 si el usuario existe y esta activo; 404 si no | 200 / 404 |

### Usuario autenticado

| Metodo | Ruta | Descripcion | Codigo |
|---|---|---|---|
| GET | `/api/usuarios/{id}` | ADMIN o el mismo usuario | 200 |
| PUT | `/api/usuarios/{id}` | ADMIN o el mismo usuario. Rol y estado solo ADMIN | 200 |

### Solo ADMIN

| Metodo | Ruta | Descripcion | Codigo |
|---|---|---|---|
| GET | `/api/usuarios?rol=` | Lista usuarios; filtro opcional `CLIENTE` o `ADMIN` | 200 |
| POST | `/api/usuarios` | Crea un usuario indicando rol y estado | 201 |
| DELETE | `/api/usuarios/{id}` | Baja logica: la cuenta queda inactiva | 204 |

---

## 6. Ejemplos

### 6.1 Registro publico

```powershell
curl.exe -s -X POST http://localhost:8081/api/usuarios/registro `
  -H "Content-Type: application/json" `
  -d '{"nombre":"Ana Torres","correo":"ana@levelup.cl","password":"Clave123!","telefono":"+56912345678","region":"metropolitana","comuna":"Santiago"}'
```

Respuesta `201 Created`:

```json
{
  "id": 2,
  "nombre": "Ana Torres",
  "correo": "ana@levelup.cl",
  "telefono": "+56912345678",
  "region": "metropolitana",
  "comuna": "Santiago",
  "rol": "CLIENTE",
  "fechaRegistro": "2026-11-14T05:29:23.071325",
  "activo": true
}
```

La contrasena nunca aparece en la respuesta.

### 6.2 Login

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/auth/login `
  -ContentType "application/json" `
  -Body '{"correo":"admin@levelup.cl","password":"Admin123!"}'

$login
$token = $login.token
```

Respuesta `200 OK`:

```json
{
  "id": 1,
  "nombre": "Administrador",
  "correo": "admin@levelup.cl",
  "rol": "ADMIN",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

Errores del login con la forma `{campo, mensaje}`:

| Caso | Codigo | Cuerpo |
|---|---|---|
| Correo inexistente | 404 | `{"campo":"correo","mensaje":"No existe una cuenta con este correo."}` |
| Contrasena incorrecta | 401 | `{"campo":"password","mensaje":"Contraseña incorrecta."}` |
| Cuenta desactivada | 403 | `{"campo":"correo","mensaje":"Tu cuenta está desactivada."}` |

### 6.3 Verificar si un usuario existe

```powershell
curl.exe -s http://localhost:8081/api/usuarios/1/existe
```

```json
{"existe":true,"id":1,"nombre":"Administrador","correo":"admin@levelup.cl"}
```

Si no existe o esta inactivo responde `404 Not Found`.

### 6.4 Listar usuarios (ADMIN)

```powershell
Invoke-RestMethod -Uri "http://localhost:8081/api/usuarios" `
  -Headers @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:8081/api/usuarios?rol=ADMIN" `
  -Headers @{ Authorization = "Bearer $token" }
```

### 6.5 Obtener un perfil

```powershell
# Un ADMIN puede ver cualquier perfil
Invoke-RestMethod -Uri "http://localhost:8081/api/usuarios/1" `
  -Headers @{ Authorization = "Bearer $token" }

# Un CLIENTE solo puede ver el suyo
$cliente = Invoke-RestMethod -Method Post -Uri http://localhost:8081/api/auth/login `
  -ContentType "application/json" `
  -Body '{"correo":"ana@levelup.cl","password":"Clave123!"}'

Invoke-RestMethod -Uri "http://localhost:8081/api/usuarios/2" `
  -Headers @{ Authorization = "Bearer $($cliente.token)" }
```

Un CLIENTE que pide el perfil de otro recibe `403 Forbidden`.

### 6.6 Crear un usuario (ADMIN)

```powershell
curl.exe -s -X POST http://localhost:8081/api/usuarios `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"nombre":"Nuevo Admin","correo":"nuevo-admin@levelup.cl","password":"Clave123!","region":"valparaiso","comuna":"Viña del Mar","rol":"ADMIN","activo":true}'
```

Responde `201 Created` con el usuario creado (sin contrasena).

### 6.7 Actualizar un perfil

```powershell
# El propio usuario puede cambiar sus datos personales
Invoke-RestMethod -Method Put -Uri "http://localhost:8081/api/usuarios/2" `
  -Headers @{ Authorization = "Bearer $($cliente.token)" } `
  -ContentType "application/json" `
  -Body '{"nombre":"Ana Actualizada","region":"valparaiso","comuna":"Viña del Mar"}'

# Solo un ADMIN puede cambiar rol o estado
Invoke-RestMethod -Method Put -Uri "http://localhost:8081/api/usuarios/2" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"rol":"ADMIN","activo":false}'
```

Los campos omitidos conservan su valor actual. Si un CLIENTE envia `rol` o
`activo` recibe `403 Forbidden`.

### 6.8 Dar de baja un usuario (ADMIN)

```powershell
Invoke-WebRequest -Method Delete -Uri "http://localhost:8081/api/usuarios/2" `
  -Headers @{ Authorization = "Bearer $token" }
```

Responde `204 No Content`. La cuenta queda con `activo=false`, no puede iniciar
sesion y `GET /api/usuarios/2/existe` pasa a responder `404`.

---

## 7. Validaciones

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio, solo letras, tildes, ñ y espacios, maximo 50 caracteres |
| `correo` | Obligatorio, formato valido, unico sin distinguir mayusculas; se guarda en minusculas |
| `password` | Minimo 8 caracteres, al menos una mayuscula, una minuscula, un numero y un simbolo `@#$%!.*` |
| `telefono` | Opcional; movil chileno `+56912345678` o `912345678` |
| `region` | Obligatorio, maximo 50 caracteres |
| `comuna` | Obligatorio, maximo 50 caracteres |
| `rol` | `CLIENTE` o `ADMIN`; en el registro publico siempre es `CLIENTE` |

Un `400 Bad Request` por validacion usa el formato comun:

```json
{
  "timestamp": "2026-11-14T05:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Hay campos invalidos",
  "detalles": {
    "correo": "El correo no tiene un formato válido",
    "password": "La contraseña debe tener al menos 8 caracteres..."
  }
}
```

Un correo ya registrado responde `409 Conflict` con
`"message": "Este correo ya está registrado."`.

---

## 8. Resumen de codigos HTTP

| Codigo | Cuando |
|---|---|
| 200 | Consulta, actualizacion o login correcto |
| 201 | Registro o creacion correcta |
| 204 | Baja logica correcta |
| 400 | Datos invalidos o rol desconocido |
| 401 | Password incorrecta o falta/expira el token |
| 403 | Sin permisos, cuenta desactivada o intento de cambiar el propio rol |
| 404 | Usuario o correo inexistente |
| 409 | Correo ya registrado |

---

## 9. Pruebas y cobertura

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
.\mvnw.cmd -pl ms-login -am verify
```

- JUnit 5 + Mockito para servicios y JWT.
- MockMvc contra el contexto completo para los endpoints y la seguridad real.
- JaCoCo exige un minimo de **60%** de lineas y falla el build si no se cumple.
- Reporte: `ms-login/target/site/jacoco/index.html`.

Resultado actual: **62 pruebas en verde** y **98,35% de cobertura de lineas**.

---

## 10. Solucion de problemas

| Sintoma | Causa probable | Solucion |
|---|---|---|
| `Unknown database 'db_login'` | Volumen MySQL creado antes del renombre | Crear `db_login` o recrear el volumen |
| `Access denied for user 'levelup'` | Falta el GRANT sobre `db_login` | Ejecutar el `GRANT` del paso 2 |
| `401` con un token recien emitido | `JWT_SECRET` distinto entre servicios | Usar el mismo secreto en todos |
| `403` al crear productos | El token no es de ADMIN | Iniciar sesion con `admin@levelup.cl` |
| Swagger no abre | El servicio no esta arriba o el puerto esta ocupado | Revisar `http://localhost:8081/actuator/health` |
