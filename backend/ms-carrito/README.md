# ms-carrito

Microservicio de **carrito de compras** de Level-Up Gamer. Administra los items
de cada usuario, valida stock y precios contra `ms-productos` y aplica cupones.

- Puerto: **8083**
- Base de datos: **db_carrito** (MySQL 8)
- Paquete base: `cl.levelup.carrito`
- Seguridad: JWT emitido por `ms-login` (mismo secreto compartido)

No procesa pagos ni crea ordenes: solo mantiene el carrito.

## Requisitos

- Java 21
- MySQL 8 con la base `db_carrito` creada (ver `../db/init.sql`)
- `ms-login` corriendo (para obtener el token)
- `ms-productos` corriendo (se consulta al agregar o modificar items)

## Arranque

```powershell
# desde backend/
.\mvnw.cmd -pl ms-carrito -am spring-boot:run
```

o con el jar ya compilado:

```powershell
& "$env:JAVA_HOME\bin\java.exe" -jar ms-carrito\target\ms-carrito-1.0.0.jar
```

Comprobacion:

```text
GET http://localhost:8083/actuator/health   -> {"status":"UP"}
```

Swagger: <http://localhost:8083/swagger-ui.html>

## Como obtener el token

```text
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{ "correo": "admin@levelup.cl", "password": "Admin123!" }
```

Copia el campo `token` y usalo en Postman como **Bearer Token** (sin escribir la
palabra `Bearer`).

El JWT incluye el `id` del usuario. Un **CLIENTE** solo puede operar su propio
carrito; un **ADMIN** puede ver el de cualquiera.

## Endpoints

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/carritos/{usuarioId}` | Carrito con items y totales (vacio si no existe) |
| POST | `/api/carritos/{usuarioId}/items` | Agrega `{productoId, cantidad}`; si ya existe, suma |
| PUT | `/api/carritos/{usuarioId}/items/{productoId}` | Cambia `{cantidad}`; 0 elimina el item |
| DELETE | `/api/carritos/{usuarioId}/items/{productoId}` | Quita un producto (204) |
| DELETE | `/api/carritos/{usuarioId}` | Vacía el carrito y quita el cupón (204) |
| POST | `/api/carritos/{usuarioId}/cupon` | Aplica `{codigo}` |
| DELETE | `/api/carritos/{usuarioId}/cupon` | Quita el cupón |

### Formato de respuesta

```json
{
  "usuarioId": 5,
  "items": [
    {
      "productoId": 10,
      "nombre": "Catan",
      "imagen": "/img/catan.png",
      "precioUnitario": 29990,
      "cantidad": 2,
      "subtotal": 59980
    }
  ],
  "totalUnidades": 2,
  "subtotal": 59980,
  "descuento": 5998,
  "total": 53982,
  "cuponCodigo": "LEVELUP10"
}
```

Las modificaciones (`POST` / `PUT` / cupones) devuelven el carrito completo para
que el frontend no tenga que volver a consultarlo.

## Cupones

| Codigo | Descuento |
|---|---|
| `LEVELUP10` | 10% |
| `GAMER20` | 20% |

No distinguen mayusculas ni espacios. Un codigo invalido responde **400** con
`"detalles": { "codigo": "Cupón inválido." }`.

`descuento = round(subtotal * porcentaje / 100)` y `total = subtotal - descuento`.

## Validacion contra ms-productos

Al agregar o modificar un producto se llama a `GET /api/productos/{id}` con el
mismo `Authorization` del usuario, y se copian `nombre`, `imagen` y
`precioFinal`. Reglas:

- Producto inexistente → **404**.
- Sin stock o cantidad pedida (incluyendo lo que ya estaba en el carrito) mayor
  al stock → **409**.
- `ms-productos` caido o sin respuesta → **503**.

La URL se configura en `application.properties`:

```properties
productos.url=${PRODUCTOS_URL:http://localhost:8082}
productos.timeout-ms=${PRODUCTOS_TIMEOUT_MS:2000}
```

## Ejemplos

Agregar dos unidades del producto 10:

```text
POST http://localhost:8083/api/carritos/5/items
Authorization: Bearer <token>
Content-Type: application/json

{ "productoId": 10, "cantidad": 2 }
```

Aplicar cupón:

```text
POST http://localhost:8083/api/carritos/5/cupon
Authorization: Bearer <token>
Content-Type: application/json

{ "codigo": "levelup10" }
```

Vaciar el carrito (lo usara `ms-ordenes` después de una compra pagada):

```text
DELETE http://localhost:8083/api/carritos/5
Authorization: Bearer <token>
```

## Errores

| Codigo | Caso |
|---|---|
| 400 | Cantidad negativa, cupón inválido o cuerpo mal formado |
| 401 | Sin token o token inválido |
| 403 | Un CLIENTE intentando operar el carrito de otro usuario |
| 404 | Producto inexistente o item que no está en el carrito |
| 409 | Stock insuficiente |
| 503 | `ms-productos` no responde |

## Pruebas

```powershell
.\mvnw.cmd -pl ms-carrito -am verify
```

Incluye pruebas unitarias con Mockito, pruebas de API con MockMvc sobre H2 y el
reporte JaCoCo con un mínimo de **60%** de cobertura de líneas.

Reporte: `ms-carrito/target/site/jacoco/index.html`
