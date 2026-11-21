# Manual de usuario – Level-Up Gamer

**Versión:** 3.0  
**Evaluación:** EP3 + Evaluación Final de Taller (DSY1104)  
**Fecha:** Noviembre 2026

Este manual explica cómo usar la tienda online Level-Up Gamer en su versión desplegada. Está pensado para dos perfiles: **cliente** y **administrador**.

---

## 1. Acceso a la aplicación

Abrir en el navegador:

```text
http://184.72.249.146/
```

La tienda se sirve desde Nginx en el puerto `80`. El catálogo se obtiene desde el microservicio `ms-productos` (puerto `8082`) y los datos se guardan en MySQL.

### Cuentas disponibles

| Perfil | Correo | Contraseña | Rol |
|---|---|---|---|
| Administrador | `admin@levelup.cl` | `Admin123!` | `ADMIN` |
| Cliente | `cliente.pagos@levelup.cl` | `Cliente123!` | `CLIENTE` |

Ambas cuentas se crean automáticamente al iniciar el stack. También podés registrar una cuenta nueva desde **Login → Crear cuenta**; el registro público siempre asigna el rol `CLIENTE`.

---

## 2. Flujo del cliente

### 2.1 Catálogo

Desde el menú podés navegar por:

- **Home:** productos destacados y acceso rápido al catálogo.
- **Productos:** catálogo completo con filtros por categoría y búsqueda por texto.
- **Categorías:** accesos directos a cada categoría.
- **Ofertas:** productos con descuento.

Al hacer clic en una tarjeta se abre el **detalle del producto**, con imagen, precio, descuento, stock y botón para agregarlo al carrito.

Un producto con stock `0` se muestra como **Sin stock** y no puede agregarse.

### 2.2 Registro e inicio de sesión

1. Clic en **Login**.
2. Ingresar correo y contraseña.
3. Clic en **Ingresar**.

El sistema valida:

- correo con formato válido;
- contraseña de al menos 8 caracteres, con mayúscula, minúscula, número y símbolo;
- nombre, teléfono móvil chileno, región y comuna al registrarse.

Los errores aparecen junto al campo correspondiente, sin recargar la página. Después de iniciar sesión, la sesión se mantiene al recargar el navegador.

### 2.3 Carrito

Podés usar el carrito **sin iniciar sesión**; al hacer login, el carrito local se sube al microservicio `ms-carrito`.

Acciones disponibles:

- agregar productos;
- cambiar la cantidad;
- eliminar un ítem;
- vaciar el carrito;
- aplicar o quitar un cupón.

El contador del encabezado muestra la **cantidad total de unidades**, no la cantidad de líneas. Por ejemplo, dos productos con cantidades 2 y 3 muestran `5`.

#### Cupones

| Código | Descuento |
|---|---|
| `LEVELUP10` | 10% |
| `GAMER20` | 20% |

El descuento lo calcula el servidor (`ms-carrito`) y se refleja en el resumen: subtotal, descuento y total. Un código inválido muestra un error y no modifica el total.

### 2.4 Checkout y pago

1. Desde el carrito, clic en **Finalizar compra**.
2. Completar nombre, correo, teléfono y dirección (calle, número, región y comuna).
3. Elegir la opción de entrega.
4. Elegir el método de pago:
   - **Tarjeta de crédito/débito:** ingresar un número de tarjeta de prueba.
   - **Transferencia:** no requiere tarjeta.
5. Clic en **Pagar**.

#### Tarjetas de prueba

| Terminación | Resultado |
|---|---|
| `0000` | Rechazada por fondos insuficientes |
| `1111` | Rechazada por tarjeta inválida |
| Cualquier otra terminación | Aprobada |

Ejemplo aprobado:

```text
4111111111114444
```

Si el pago es aprobado, se muestra **Compra exitosa**, se guarda el resumen de la orden y se vacía el carrito. Si es rechazado, se muestra **Compra fallida** con el motivo y el carrito se conserva para intentar de nuevo.

> El pago es una simulación académica: no se contacta a un proveedor real y solo se guardan los últimos cuatro dígitos de la tarjeta.

---

## 3. Flujo del administrador

Ingresar con:

```text
admin@levelup.cl / Admin123!
```

Luego abrir **Admin** desde el menú. El panel tiene dos secciones.

### 3.1 Productos

Tabla **Productos**:

- **Nuevo producto:** completar nombre, categoría, atributo, precio, stock e imagen.
- **Editar:** clic en el producto y modificar los campos.
- **Eliminar:** clic en eliminar y confirmar.

Si escribís una categoría que no existe, el sistema la crea automáticamente antes de guardar el producto. Los cambios se reflejan de inmediato en el Home, el catálogo y el panel.

También podés consultar el stock crítico: productos con `5` unidades o menos, incluidos los agotados.

### 3.2 Usuarios

Tabla **Usuarios**:

- listar todos los usuarios;
- crear un usuario indicando correo, nombre, rol y estado;
- editar datos, rol o estado;
- eliminar un usuario.

Solamente un `ADMIN` puede asignar el rol `ADMIN` o cambiar el estado de una cuenta. Un `CLIENTE` que intente entrar a esta sección ve un mensaje de acceso denegado.

### 3.3 Pagos

El administrador puede consultar el historial completo de pagos y filtrar por estado. Un cliente solo puede ver los pagos de su propia orden.

---

## 4. Códigos de estado que puede ver el usuario

| Código | Significado | Ejemplo |
|---|---|---|
| `200` | Operación correcta | Login, listado, actualización |
| `201` | Recurso creado | Producto, usuario o pago |
| `204` | Eliminación correcta | Borrar producto o usuario |
| `400` | Datos inválidos | Contraseña débil, cupón inexistente |
| `401` | Sin token o credenciales incorrectas | Login fallido, sesión expirada |
| `403` | Rol no autorizado | Cliente intentando crear productos |
| `404` | No existe | Producto o usuario inexistente |
| `409` | Conflicto | Correo duplicado, stock insuficiente, segundo pago aprobado |
| `503` | Servicio dependiente no disponible | `ms-carrito` no puede consultar `ms-productos` |

---

## 5. Demo rápida de 5 minutos

1. Abrir `http://184.72.249.146/`.
2. Ingresar como `cliente.pagos@levelup.cl` / `Cliente123!`.
3. Agregar un producto al carrito.
4. Aplicar el cupón `LEVELUP10`.
5. Finalizar compra con la tarjeta `4111111111114444`.
6. Ver la pantalla **Compra exitosa**.
7. Cerrar sesión e ingresar como `admin@levelup.cl` / `Admin123!`.
8. En **Admin → Productos**, crear un producto nuevo.
9. Verificar que aparece en `http://184.72.249.146:8082/api/productos`.

---

## 6. Evidencias y documentación relacionada

- Captura general de la tienda: `entregables/evidencia/demo-frontend.png`.
- Flujo real verificado: `entregables/evidencia/verificacion-backend.txt`.
- Colección Postman: `entregables/LevelUp_Gamer.postman_collection.json`.
- Documentación de Swagger: [Documentacion_APIs_Swagger.md](Documentacion_APIs_Swagger.md).
- Integración frontend/backend: [Documento_APIs_e_Integracion.md](Documento_APIs_e_Integracion.md).
- Requisitos: [ERS.md](ERS.md).

---

## 7. Limitaciones conocidas

- El pago no es real; simula el resultado según la terminación de la tarjeta.
- No existe un microservicio de órdenes: el `ordenId` es un identificador simbólico.
- `ms-carrito` valida stock contra `ms-productos`, pero no lo reserva ni lo descuenta automáticamente al pagar. El endpoint manual `POST /api/productos/stock/descontar` sí está disponible para administradores.
- El JWT dura 120 minutos; al vencer hay que iniciar sesión de nuevo.
