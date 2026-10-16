# Especificación de Requisitos de Software (ERS)
## Proyecto: Level-Up Gamer

**Asignatura:** DSY1104 – Desarrollo Fullstack II
**Autor:** Tomás Torres Delgado
**Versión:** 2.0 (Octubre 2026)

### Historial de versiones

| Versión | Fecha | Evaluación | Cambios |
|---|---|---|---|
| 1.0 | Septiembre 2026 | Evaluación Formativa N.° 1 | Sitio estático con HTML, CSS, Bootstrap y JavaScript (4 vistas) |
| 2.0 | Octubre 2026 | Segunda evaluación (EP2) | Migración a React: rutas, estado global, sesión con roles y panel de administración con CRUD |

---

## 1. Introducción

Level-Up Gamer es una tienda online dedicada a satisfacer las necesidades de los entusiastas de los videojuegos en Chile. Ofrece productos para gamers, desde juegos de mesa y accesorios hasta consolas, computadores y sillas especializadas. Aunque no cuenta con una ubicación física, realiza despachos a todo el país.

Este documento describe los requisitos funcionales y no funcionales del sitio web. En su primera versión se desarrolló como sitio estático. En esta segunda versión se migró a una aplicación React que incorpora navegación por rutas, estado compartido mediante Context, sesión de usuario con roles y un panel de administración para gestionar el catálogo.

## 2. Propósito y alcance

El sistema busca ofrecer una experiencia de compra simple a la comunidad gamer chilena, permitiendo:

- Crear una cuenta de usuario e iniciar sesión.
- Explorar un catálogo de productos gamer.
- Agregar productos a un carrito, ajustar cantidades y aplicar cupones de descuento.
- Simular el proceso de pago.
- Administrar el catálogo (crear, ver, editar y eliminar productos) mediante un panel exclusivo para el administrador.

El alcance se limita al frontend, sin conexión a una base de datos ni a un servidor. Toda la información (productos, carrito, cuentas y sesión) se almacena en el navegador mediante `localStorage`.

### Fuera de alcance

- Pasarela de pago real.
- Envío de correos de confirmación.
- Autenticación y autorización validadas en un servidor.
- Almacenamiento seguro de contraseñas (en esta etapa se guardan en el navegador con fines de simulación).
- Base de datos compartida entre usuarios.

## 3. Actores del sistema

| Actor | Descripción |
|---|---|
| Visitante | Usuario sin sesión que navega el catálogo y puede agregar productos al carrito. Puede registrarse o iniciar sesión. |
| Cliente | Usuario registrado con sesión iniciada. Gestiona su carrito y realiza la compra simulada. |
| Administrador | Usuario con rol `admin`. Además de lo anterior, accede al panel de administración para gestionar los productos. |

## 4. Requisitos funcionales

La columna *Etapa* indica en qué versión del sistema se implementó cada requisito.

### 4.1 Usuarios y sesión

| N.° | Requisito | Etapa |
|---|---|---|
| RF-01 | El sistema debe permitir registrar un usuario mediante un formulario con nombre, correo, confirmación de correo, contraseña, confirmación de contraseña, teléfono (opcional), región y comuna. | EP1 y EP2 |
| RF-02 | El sistema debe validar que el correo no esté previamente registrado. | EP1 y EP2 |
| RF-03 | El sistema debe validar la contraseña: mínimo 8 caracteres, mayúscula, minúscula, número y un símbolo entre `@#$%!.*`. | EP1 y EP2 |
| RF-04 | El sistema debe validar el nombre (solo letras y espacios, máximo 50 caracteres) y el teléfono opcional (móvil chileno). | EP1 y EP2 |
| RF-05 | Las comunas disponibles deben depender de la región seleccionada. | EP1 y EP2 |
| RF-06 | Los errores de validación deben mostrarse junto al campo correspondiente, sin recargar la página. | EP1 y EP2 |
| RF-07 | El sistema debe permitir iniciar sesión con correo y contraseña. | EP1 y EP2 |
| RF-08 | El sistema debe informar de forma específica si el error de inicio de sesión se debe a una cuenta inexistente o a una contraseña incorrecta. | EP1 y EP2 |
| RF-09 | La sesión iniciada debe mantenerse al recargar la página, y el usuario debe poder cerrarla. | EP2 |
| RF-10 | Cada usuario debe tener un rol (`cliente` o `admin`). Al iniciar sesión, el administrador debe ser dirigido al panel de administración. | EP2 |

### 4.2 Catálogo y carrito

| N.° | Requisito | Etapa |
|---|---|---|
| RF-11 | El sistema debe mostrar un catálogo de productos con imagen, nombre, atributo, precio y opción de agregar al carrito. | EP1 y EP2 |
| RF-12 | En el Home deben mostrarse productos destacados, y en la página Productos el catálogo completo. | EP2 |
| RF-13 | Un producto con stock 0 debe mostrarse como "Sin stock" y no debe poder agregarse al carrito. | EP2 |
| RF-14 | El sistema debe permitir agregar productos al carrito, aumentar o disminuir su cantidad y calcular el total. | EP1 y EP2 |
| RF-15 | Un producto cuya cantidad llegue a cero debe eliminarse del carrito. | EP1 y EP2 |
| RF-16 | El carrito vacío debe informar su estado y ofrecer volver al catálogo. | EP1 y EP2 |
| RF-17 | El sistema debe permitir aplicar un cupón de descuento e informar si es válido o inválido. | EP1 y EP2 |
| RF-18 | El sistema debe simular el pago, mostrando un error si el carrito está vacío. | EP1 y EP2 |
| RF-19 | El indicador "Cart (n)" del encabezado debe reflejar la cantidad de unidades del carrito en todas las páginas. | EP1 y EP2 |

### 4.3 Panel de administración

| N.° | Requisito | Etapa |
|---|---|---|
| RF-20 | El administrador debe poder ver el listado de productos en una tabla (imagen, nombre, categoría, precio y stock). | EP2 |
| RF-21 | El administrador debe poder crear un producto mediante un formulario con nombre, categoría, atributo, precio, stock e imagen. | EP2 |
| RF-22 | El administrador debe poder editar un producto existente reutilizando el mismo formulario. | EP2 |
| RF-23 | El administrador debe poder eliminar un producto, previa confirmación. | EP2 |
| RF-24 | El formulario del panel debe validar sus campos (precio entero mayor a 0, stock entero de 0 o más, categoría obligatoria) y mostrar los errores junto a cada campo. | EP2 |
| RF-25 | Los cambios hechos en el panel deben reflejarse de inmediato en el Home y en el catálogo. | EP2 |
| RF-26 | La ruta `/admin` debe estar protegida: si el usuario no es administrador, debe redirigirse al inicio de sesión. | EP2 |

### 4.4 Persistencia y navegación

| N.° | Requisito | Etapa |
|---|---|---|
| RF-27 | El sistema debe guardar productos, carrito, usuarios y sesión en `localStorage`, conservándolos al recargar la página. | EP1 y EP2 |
| RF-28 | La navegación entre Home, Productos, Carrito, Login, Registro y Admin debe realizarse sin recargar la página. | EP2 |

## 5. Requisitos no funcionales

| N.° | Requisito |
|---|---|
| RNF-01 | El sitio debe visualizarse correctamente en navegadores modernos (Chrome, Edge, Firefox). |
| RNF-02 | El sitio debe ser responsive, adaptándose a escritorio, tablet y celular. |
| RNF-03 | El sistema no requiere servidor ni base de datos; la persistencia ocurre en el navegador del usuario. |
| RNF-04 | La EP1 debe usar etiquetado HTML semántico y una única hoja de estilos externa. |
| RNF-05 | La EP2 debe organizarse en componentes reutilizables (por ejemplo, tarjeta de producto y campo de formulario) y en páginas separadas por ruta. |
| RNF-06 | El estado compartido (productos, carrito y sesión) debe gestionarse con Context API, y el estado local de cada pantalla con `useState`. |
| RNF-07 | La identidad visual (paleta oscura con acentos morados, tipografía y botones) debe mantenerse coherente en todas las páginas. |
| RNF-08 | Las imágenes de productos deben mostrarse completas, sin recortes. |

## 6. Reglas de negocio

- **Cupones válidos:** `LEVELUP10` (10% de descuento) y `GAMER20` (20% de descuento). Un cupón inválido muestra un error y no modifica el total.
- **Contador del carrito:** cuenta unidades, no líneas. Dos productos distintos con cantidades 2 y 3 muestran "5".
- **Stock:** un producto con stock 0 se considera agotado.
- **Rol administrador:** existe una cuenta de demostración (`admin@levelup.cl`) incluida en el código, ya que no hay servidor.

## 7. Tecnologías utilizadas

**Primera evaluación**
- HTML5 semántico, CSS3 con Bootstrap y hoja de estilos propia, JavaScript sin librerías, `localStorage`.

**Segunda evaluación**
- **React**: construcción de la interfaz con componentes y JSX.
- **Vite**: herramienta de creación y ejecución del proyecto.
- **React Router**: rutas y navegación sin recarga.
- **Context API** (`useContext`) y **`useState`**: manejo de estado global y local.
- **`useEffect`**: sincronización automática del estado con `localStorage`.
- **Bootstrap 5** instalado como paquete, más una hoja de estilos propia (`src/index.css`).
- **Git y GitHub**: control de versiones y publicación.

## 8. Arquitectura de la aplicación React

```
level-up-react/
├── public/img/
├── src/
│   ├── components/    Header, Footer, ProductCard, Campo, RutaAdmin
│   ├── context/       AuthContext, ProductosContext, CarritoContext
│   ├── data/          productosIniciales.js, regiones.js
│   ├── pages/         Home, Productos, Carrito, Login, Registro, Admin
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
└── package.json
```

| Contexto | Responsabilidad | Clave en `localStorage` |
|---|---|---|
| `ProductosContext` | Lista de productos y operaciones de crear, editar y eliminar | `productos` |
| `CarritoContext` | Carrito, cantidades, total y contador | `carrito` |
| `AuthContext` | Usuarios, registro, login, cierre de sesión y rol | `usuarios`, `usuarioActivo` |

## 9. Catálogo inicial de productos

| Categoría | Producto | Precio | Stock inicial |
|---|---|---|---|
| Juegos de Mesa | Catan | $29.990 CLP | 10 |
| Juegos de Mesa | Carcassonne | $24.990 CLP | 10 |
| Accesorios | Controlador Xbox Series X | $59.990 CLP | 10 |
| Accesorios | Audífonos HyperX Cloud II | $79.990 CLP | 10 |
| Videojuegos | GTA6 (Versión Digital) | $429.990 CLP | 0 (sin stock) |
| Computadores Gamers | PC Gamer ASUS ROG Strix | $1.299.990 CLP | 5 |
| Sillas Gamers | Silla Gamer Secretlab Titan | $349.990 CLP | 5 |
| Mouse | Mouse Logitech G502 HERO | $49.990 CLP | 10 |

## 10. Limitaciones conocidas

- La protección de la ruta `/admin` y la validación del rol se realizan en el navegador, por lo que no son seguras frente a alguien que modifique `localStorage`. Un sistema real debe validarlas en el servidor.
- Las contraseñas se guardan en texto plano en el navegador, solo para simular el funcionamiento. En un sistema real se almacenan cifradas en una base de datos.
- Los datos no se comparten entre navegadores ni entre usuarios.
- El formulario de boletín del pie de página es solo visual.