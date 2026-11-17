# ms-pagos

Microservicio de **cobros simulados** de Level-Up Gamer. No existe una pasarela
real: el servicio decide si el pago queda `APROBADO` o `RECHAZADO` con reglas
deterministas y guarda el registro del intento.

- Puerto: **8085**
- Base de datos: **db_pagos** (MySQL 8)
- Paquete base: `cl.levelup.pagos`
- Seguridad: JWT emitido por `ms-login` (mismo secreto compartido)

## Requisitos

- Java 21
- MySQL 8 con la base `db_pagos` creada (ver `../db/init.sql`)
- `ms-login` corriendo para obtener un token

## Arranque

```powershell
# desde backend/
.\mvnw.cmd -pl ms-pagos -am spring-boot:run
```

o con el jar ya compilado:

```powershell
& "$env:JAVA_HOME\bin\java.exe" -jar ms-pagos\target\ms-pagos-1.0.0.jar
```

Comprobacion:

```text
GET http://localhost:8085/actuator/health   -> {"status":"UP"}
```

Swagger: <http://localhost:8085/swagger-ui.html>

## Como obtener el token

```text
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{ "correo": "admin@levelup.cl", "password": "Admin123!" }
```

Copia el campo `token` y usalo en Postman como **Bearer Token** (sin escribir la
palabra `Bearer`).

## Endpoints

| Metodo | Ruta | Acceso | Descripcion |
|---|---|---|---|
| POST | `/api/pagos` | autenticado | Registra un intento de cobro (201) |
| GET | `/api/pagos/{id}` | autenticado | Detalle de un pago |
| GET | `/api/pagos/orden/{ordenId}` | autenticado | Historial de intentos de una orden |
| GET | `/api/pagos` | ADMIN | Lista completa, filtro opcional `?estado=` |

Un pago **rechazado no es un error HTTP**: responde `201` con
`"estado": "RECHAZADO"` y su `motivoRechazo`.

Si la orden ya tiene un pago `APROBADO`, un nuevo intento responde **409**.

## Reglas de la simulacion

| Situacion | Resultado |
|---|---|
| `TRANSFERENCIA` | APROBADO |
| Tarjeta que **no** termina en `0000` ni `1111` | APROBADO |
| Tarjeta termina en `0000` | RECHAZADO - "Fondos insuficientes" |
| Tarjeta termina en `1111` | RECHAZADO - "Tarjeta inválida" |

El numero de tarjeta se usa solo en memoria: se limpian los espacios, se exigen
16 digitos y se guardan **unicamente los 4 ultimos**. El numero completo nunca se
persiste ni se escribe en los logs ni en las respuestas.

## Ejemplo: pago aprobado

```text
POST http://localhost:8085/api/pagos
Authorization: Bearer <token>
Content-Type: application/json

{
  "ordenId": 101,
  "monto": 19990,
  "metodo": "TARJETA_CREDITO",
  "numeroTarjeta": "4111 1111 1111 1234"
}
```

Respuesta `201 Created`:

```json
{
  "id": 1,
  "ordenId": 101,
  "monto": 19990,
  "metodo": "TARJETA_CREDITO",
  "ultimosDigitos": "1234",
  "estado": "APROBADO",
  "codigoTransaccion": "9f4c1c1e-6a0b-4f6e-9f0d-3b7a2c5d8e11",
  "motivoRechazo": null,
  "fecha": "2026-11-17T10:15:30"
}
```

## Ejemplo: pago rechazado

```text
POST http://localhost:8085/api/pagos
Authorization: Bearer <token>
Content-Type: application/json

{
  "ordenId": 102,
  "monto": 19990,
  "metodo": "TARJETA_DEBITO",
  "numeroTarjeta": "4111111111110000"
}
```

Respuesta `201 Created`:

```json
{
  "id": 2,
  "ordenId": 102,
  "monto": 19990,
  "metodo": "TARJETA_DEBITO",
  "ultimosDigitos": "0000",
  "estado": "RECHAZADO",
  "codigoTransaccion": "2b7d4a90-1f33-4a2e-8c55-77e1b0c9a444",
  "motivoRechazo": "Fondos insuficientes",
  "fecha": "2026-11-17T10:16:02"
}
```

Tarjeta terminada en `1111` produce `"motivoRechazo": "Tarjeta inválida"`.

## Errores

| Codigo | Caso |
|---|---|
| 400 | Campos invalidos (incluye `detalles` por campo, ej. `monto`, `numeroTarjeta`) |
| 401 | Sin token o token invalido |
| 403 | Cliente intentando ver el historial completo |
| 404 | Pago inexistente |
| 409 | La orden ya tiene un pago aprobado |

## Pruebas

```powershell
.\mvnw.cmd -pl ms-pagos -am verify
```

Incluye pruebas unitarias con Mockito, pruebas de API con MockMvc sobre H2 y el
reporte JaCoCo con un minimo de **60%** de cobertura de lineas.

Reporte: `ms-pagos/target/site/jacoco/index.html`
