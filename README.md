# Especificación de Requisitos de Software (ERS)
## Proyecto: Level-Up Gamer

**Asignatura:** DSY1104 – Desarrollo Fullstack II
**Evaluación:** Evaluación Formativa N.° 1 — Creando mi primera tienda web
**Autor:** Tomás Torres Delgado
**Fecha:** Septiembre 2026

---

## 1. Introducción

Level-Up Gamer es una tienda online dedicada a satisfacer las necesidades de los entusiastas de los videojuegos en Chile. Ofrece una amplia gama de productos para gamers, desde juegos de mesa y accesorios hasta consolas, computadores y sillas especializadas. Aunque no cuenta con una ubicación física, realiza despachos a todo el país.

Este documento describe los requisitos funcionales y no funcionales del sitio web desarrollado como parte de la Evaluación Formativa N.° 1 del ramo Desarrollo Fullstack II, cuyo objetivo es aplicar HTML semántico, una hoja de estilos CSS externa y JavaScript para validar formularios y persistir datos en el navegador.

## 2. Propósito y alcance

El propósito del sistema es ofrecer una experiencia de compra simple y personalizada a la comunidad gamer chilena, permitiendo:

- Crear una cuenta de usuario y luego iniciar sesión con ella.
- Explorar un catálogo de productos gamer.
- Agregar productos a un carrito de compras, ajustar cantidades y aplicar cupones de descuento.
- Simular el proceso de pago (sin pasarela de pago real, ya que en esta etapa el proyecto no cuenta con servidor).

El alcance de esta etapa se limita al frontend (HTML, CSS y JavaScript), sin conexión a una base de datos ni backend. Toda la información de usuarios y del carrito se almacena localmente en el navegador mediante `localStorage`.

### Fuera de alcance (para esta etapa)
- Pasarela de pago real.
- Panel de administración de productos.
- Envío de correos de confirmación.
- Autenticación mediante servidor o base de datos.

## 3. Actores del sistema

| Actor | Descripción |
|---|---|
| Visitante | Usuario no registrado que navega el catálogo, pero no puede finalizar una compra sin registrarse. |
| Usuario registrado | Cliente que creó una cuenta, puede iniciar sesión y gestionar su carrito de compras. |

## 4. Requisitos funcionales

| N.° | Requisito |
|---|---|
| RF-01 | El sistema debe permitir registrar un nuevo usuario mediante un formulario con nombre, correo, confirmación de correo, contraseña, confirmación de contraseña, teléfono (opcional), región y comuna. |
| RF-02 | El sistema debe validar que el correo ingresado en el registro no esté previamente registrado. |
| RF-03 | El sistema debe validar el formato y seguridad de la contraseña (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo). |
| RF-04 | El sistema debe permitir iniciar sesión mediante correo y contraseña, verificando las credenciales contra los usuarios almacenados. |
| RF-05 | El sistema debe informar de forma específica si el error de inicio de sesión se debe a una cuenta inexistente o a una contraseña incorrecta. |
| RF-06 | El sistema debe mostrar un catálogo de 8 productos, cada uno con imagen, nombre, atributo, precio y opción de agregar al carrito. |
| RF-07 | El sistema debe permitir agregar productos al carrito de compras, visualizar los productos agregados, modificar sus cantidades y calcular el total. |
| RF-08 | El sistema debe eliminar un producto del carrito cuando su cantidad llegue a cero. |
| RF-09 | El sistema debe permitir ingresar un cupón de descuento, validando si es correcto e informando el resultado. |
| RF-10 | El sistema debe simular el proceso de pago, informando error si el carrito está vacío. |
| RF-11 | El sistema debe persistir los datos de usuarios y del carrito de compras en el navegador (`localStorage`), manteniéndolos tras recargar la página. |
| RF-12 | El indicador "Cart (n)" del encabezado debe reflejar en todo momento la cantidad de productos en el carrito, en las cuatro vistas del sitio. |

## 5. Requisitos no funcionales

| N.° | Requisito |
|---|---|
| RNF-01 | El sitio debe visualizarse correctamente en navegadores modernos (Chrome, Edge, Firefox). |
| RNF-02 | El sitio debe ser responsive, adaptándose a pantallas de escritorio, tablet y celular. |
| RNF-03 | El sitio no requiere conexión a servidor ni base de datos; toda persistencia ocurre en el navegador del usuario. |
| RNF-04 | El código HTML debe seguir una estructura semántica (header, nav, main, section, article, footer). |
| RNF-05 | Todos los estilos deben aplicarse mediante una única hoja de estilos CSS externa, de forma consistente en las 4 páginas. |
| RNF-06 | Los formularios deben informar los errores de validación junto al campo correspondiente, sin recargar la página. |

## 6. Tecnologías utilizadas

- **HTML5** semántico para la estructura de las 4 vistas (Inicio, Registro, Inicio de sesión, Carrito).
- **CSS3**, combinando el framework **Bootstrap 5** (grilla y componentes base) con una hoja de estilos propia (`assets/css/style.css`) para la identidad visual del sitio (paleta oscura inspirada en plataformas como Steam, con acentos morados).
- **JavaScript** (vanilla, sin librerías) para la validación de formularios y la manipulación del DOM.
- **localStorage** del navegador, para persistir usuarios registrados, la sesión activa y el carrito de compras.
- **Git y GitHub** para el control de versiones y la publicación del repositorio.

## 7. Estructura del proyecto

```
fullstack2/
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── registro.js
│   │   ├── login.js
│   │   ├── carrito.js
│   │   └── carrito-comun.js
│   └── img/
├── index.html
├── registro.html
├── login.html
├── carrito.html
├── ERS.md
└── README.md
```

## 8. Catálogo de productos

| Código | Categoría | Producto | Precio |
|---|---|---|---|
| JM001 | Juegos de Mesa | Catan | $29.990 CLP |
| JM002 | Juegos de Mesa | Carcassonne | $24.990 CLP |
| AC001 | Accesorios | Controlador Inalámbrico Xbox Series X | $59.990 CLP |
| AC002 | Accesorios | Audífonos Gamer HyperX Cloud II | $79.990 CLP |
| CG001 | Computadores Gamers | PC Gamer ASUS ROG Strix | $1.299.990 CLP |
| SG001 | Sillas Gamers | Silla Gamer Secretlab Titan | $349.990 CLP |
| MS001 | Mouse | Mouse Gamer Logitech G502 HERO | $49.990 CLP |
| VJ001 | Videojuegos | GTA 6 (Versión Digital) — *Sin stock* | $429.990 CLP |
