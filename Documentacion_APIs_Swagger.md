# Documentación de APIs – Swagger / OpenAPI

**Proyecto:** Level-Up Gamer  
**Versión:** 3.0  
**Fecha:** Noviembre 2026

## 1. Qué es Swagger

Swagger (OpenAPI) es un **manual interactivo** generado automáticamente por Spring a partir de los controladores REST. No es un servicio adicional: cada microservicio expone su propia interfaz web porque incluye la dependencia `springdoc-openapi-starter-webmvc-ui`.

Permite:

- ver todos los endpoints agrupados por controlador;
- conocer el método HTTP, los parámetros y el cuerpo esperado;
- ejecutar peticiones reales con los botones **Try it out** y **Execute**;
- visualizar la respuesta y su código HTTP.

La documentación cruda en formato JSON está en `/v3/api-docs`.

---

## 2. URLs de los cuatro Swagger

| Microservicio | Puerto | Swagger UI | OpenAPI JSON | Health |
|---|---:|---|---|---|
| `ms-login` | 8081 | `http://184.72.249.146:8081/swagger-ui.html` | `/v3/api-docs` | `/actuator/health` |
| `ms-productos` | 8082 | `http://184.72.249.146:8082/swagger-ui.html` | `/v3/api-docs` | `/actuator/health` |
| `ms-carrito` | 8083 | `http://184.72.249.146:8083/swagger-ui.html` | `/v3/api-docs` | `/actuator/health` |
| `ms-pagos` | 8085 | `http://184.72.249.146:8085/swagger-ui.html` | `/v3/api-docs` | `/actuator/health` |

En local, reemplazar la IP por `localhost`. Si `/swagger-ui.html` redirige a `/swagger-ui/index.html?configUrl=...`, es comportamiento normal.

---

## 3. Cómo usar Swagger paso a paso

1. Abrir la URL del servicio.
2. Buscar el endpoint en la lista de controladores.
3. Clic en la fila para desplegarlo.
4. Clic en **Try it out**.
5. Completar parámetros o el **Request body**.
6. Clic en **Execute**.
7. Revisar **Response code** y **Response body**.

---

## 4. Cómo autorizarse con JWT

Los endpoints públicos se prueban sin token. Los protegidos requieren el JWT.

### 4.1 Obtener el token

Abrir el Swagger de `ms-login`:

```text
http://184.72.249.146:8081/swagger-ui.html
```

Ejecutar:

```http
POST /api/auth/login
```

Request body:

```json
{
  "correo": "admin@levelup.cl",
  "password": "Admin123!"
}
```

La respuesta `200` incluye:

```json
{
  "token": "...",
  "rol": "ADMIN"
}
```

### 4.2 Autorizar

En cualquier Swagger:

1. Clic en **Authorize** (icono de candado arriba).
2. Pegar **solo el token**, sin la palabra `Bearer`.
3. Clic en **Authorize** y cerrar la ventana.

El mismo token sirve en los cuatro microservicios porque todos validan el JWT con el mismo `JWT_SECRET` y extraen el rol desde los claims.

> Para probar permisos, usar también el token de `cliente.pagos@levelup.cl` / `Cliente123!`. Un endpoint de ADMIN debe responder `403` con ese token.

---

## 5. Ejemplos por microservicio

### 5.1 `ms-login` (8081)

| Método | Ruta | Acceso | Uso principal |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Obtener JWT y rol |
| POST | `/api/usuarios/registro` | Público | Crear cliente |
| GET | `/api/usuarios` | ADMIN | Listar usuarios |
| GET | `/api/usuarios/{id}` | Autenticado | Ver perfil |
| POST | `/api/usuarios` | ADMIN | Crear usuario con rol |
| PUT | `/api/usuarios/{id}` | Autenticado | Editar; rol/estado solo ADMIN |
| DELETE | `/api/usuarios/{id}` | ADMIN | Eliminar (`204`) |
| GET | `/api/usuarios/{id}/existe` | Público | Validar correo en registro |

### 5.2 `ms-productos` (8082)

Probar primero sin token:

```http
GET /api/productos?page=0&size=3
GET /api/productos/1
GET /api/productos/ofertas
GET /api/productos/criticos
GET /api/categorias
```

Con token de ADMIN:

```http
POST /api/productos
PUT /api/productos/{id}
DELETE /api/productos/{id}
POST /api/productos/stock/descontar
POST /api/productos/stock/reponer
```

Body de ejemplo para `POST /api/productos`:

```json
{
  "nombre": "Producto demo Swagger",
  "categoriaId": 1,
  "atributo": "Prueba en vivo",
  "precio": 19990,
  "descuento": 0,
  "stock": 5,
  "imagen": "/img/catan.png",
  "activo": true
}
```

Body para ajustar stock:

```json
[
  { "productoId": 1, "cantidad": 1 }
]
```

> Swagger no es una base de datos: al crear un producto desde la página web, la lista de endpoints no cambia, pero un `GET /api/productos` ejecutado después sí devuelve el producto nuevo porque ambos consultan la misma MySQL.

### 5.3 `ms-carrito` (8083)

Requiere token y que el `usuarioId` sea el del titular del carrito.

```http
GET  /api/carritos/{usuarioId}
POST /api/carritos/{usuarioId}/items
PUT  /api/carritos/{usuarioId}/items/{productoId}
DELETE /api/carritos/{usuarioId}/items/{productoId}
DELETE /api/carritos/{usuarioId}
POST /api/carritos/{usuarioId}/cupon
DELETE /api/carritos/{usuarioId}/cupon
```

Ejemplo para agregar un ítem:

```json
{
  "productoId": 1,
  "cantidad": 1
}
```

Ejemplo para aplicar cupón:

```json
{
  "codigo": "LEVELUP10"
}
```

### 5.4 `ms-pagos` (8085)

```http
POST /api/pagos
GET  /api/pagos/orden/{ordenId}
GET  /api/pagos/{id}
GET  /api/pagos          (solo ADMIN)
```

Ejemplo:

```json
{
  "ordenId": 123456,
  "monto": 26991,
  "metodo": "TARJETA_CREDITO",
  "numeroTarjeta": "4111111111114444"
}
```

Responde `201` aunque el estado sea `RECHAZADO`; el motivo se informa en el cuerpo. Solo se guardan los últimos cuatro dígitos.

---

## 6. Códigos de respuesta

| Código | Uso habitual en Swagger |
|---|---|
| `200` | Consultas y actualizaciones correctas |
| `201` | Creación de producto, usuario o pago |
| `204` | Eliminación sin cuerpo |
| `400` | Validación fallida o cupón inválido |
| `401` | Falta token o credenciales incorrectas |
| `403` | Rol insuficiente o recurso de otro usuario |
| `404` | Identificador inexistente |
| `409` | Conflicto: correo duplicado, stock insuficiente o pago duplicado |
| `503` | Servicio dependiente caído, por ejemplo `ms-productos` desde `ms-carrito` |

---

## 7. Relación con Postman

La colección `entregables/LevelUp_Gamer.postman_collection.json` contiene **48 peticiones** con pruebas automáticas (`pm.test`). Swagger sirve para explorar y entender cada endpoint; Postman sirve para ejecutar el flujo completo de una vez.

Antes de correr la colección contra la EC2, cambiar las variables:

```text
baseLogin     = http://184.72.249.146:8081
baseProductos = http://184.72.249.146:8082
baseCarrito   = http://184.72.249.146:8083
basePagos     = http://184.72.249.146:8085
```

---

## 8. Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| La página no abre | Servicio detenido o puerto bloqueado | Verificar `/actuator/health` y `docker compose ps` |
| `401` en endpoint protegido | Token no enviado | Usar **Authorize** |
| `403` con token válido | Rol incorrecto | Usar token de ADMIN |
| `404` al abrir Swagger | Ruta alternativa | Probar `/swagger-ui/index.html` |
| El catálogo no muestra el cambio | Resultado cacheado por el navegador | Volver a ejecutar el `GET` |
| `503` desde carrito | `ms-productos` no responde | Revisar health del puerto 8082 |

---

## 9. Evidencia sugerida

Para la defensa se recomienda tomar capturas de:

1. `GET /api/productos?page=0&size=3` en `8082` con respuesta `200`.
2. `POST /api/auth/login` en `8081` con token y rol `ADMIN`.
3. `POST /api/productos` con token de ADMIN y respuesta `201`.
4. `POST /api/pagos` en `8085` con estado `APROBADO`.

Estas capturas complementan el archivo `entregables/evidencia/verificacion-backend.txt`.
