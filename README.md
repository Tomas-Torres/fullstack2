# Level-Up Gamer 🎮

Tienda online de productos para gamers, desarrollada para el ramo **DSY1104 – Desarrollo Fullstack II** (Duoc UC).

Este repositorio contiene las dos evaluaciones del ramo:

| Carpeta | Evaluación | Tecnologías |
|---|---|---|
| Raíz (`index.html`, `registro.html`, `login.html`, `carrito.html`, `assets/`) | Evaluación Formativa N.° 1 | HTML5, CSS3, Bootstrap, JavaScript |
| `level-up-react/` | Segunda evaluación (EP2) | React, Vite, React Router, Context API |

---

## Segunda evaluación: tienda en React

Migración del sitio estático a una aplicación React con rutas, estado global, sesión de usuario y panel de administración con CRUD de productos.

### Cómo ejecutarla

Requisito: tener [Node.js](https://nodejs.org) instalado (versión LTS reciente).

```bash
cd level-up-react
npm install
npm run dev
```

Luego abre en el navegador la dirección que muestra la terminal, normalmente **http://localhost:5173**. Para detener el servidor, presiona `Ctrl + C`.

### Cuentas y cupones de prueba

| Dato | Valor |
|---|---|
| Administrador (correo) | `admin@levelup.cl` |
| Administrador (contraseña) | `Admin123!` |
| Cupones de descuento | `LEVELUP10` (10%) y `GAMER20` (20%) |

La cuenta de administrador existe solo con fines de demostración, ya que en esta etapa no hay servidor. Los clientes se crean desde la página de Registro.

### Páginas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Home: portada y productos destacados | Público |
| `/productos` | Catálogo completo | Público |
| `/carrito` | Carrito de compras con cupón y pago simulado | Público |
| `/login` | Inicio de sesión | Público |
| `/registro` | Registro de usuario con validaciones | Público |
| `/admin` | Panel de administración (CRUD de productos) | Solo administrador |

### Funcionalidades

- **Navegación sin recargar** la página, con React Router.
- **Catálogo** cargado desde `localStorage`; los productos con stock 0 se muestran como "Sin stock" y no se pueden agregar.
- **Carrito** compartido entre todas las páginas mediante Context: agregar, sumar, restar, eliminar (cantidad cero), total, contador en el encabezado, cupón de descuento y pago simulado.
- **Registro** con validación de cada campo y mensajes junto al campo (nombre, correo único, contraseña segura, teléfono chileno opcional, región y comuna dependientes).
- **Login** que distingue entre cuenta inexistente y contraseña incorrecta, con sesión que se mantiene al recargar y opción de cerrar sesión.
- **Panel de administración** con CRUD completo: crear, listar, editar y eliminar productos. Los cambios se reflejan de inmediato en el catálogo. La ruta `/admin` redirige al login si el usuario no es administrador.

### Gestión de datos

No hay servidor: todo se guarda en el navegador con `localStorage`, y el estado se comparte con `useState` y `useContext`.

| Clave de `localStorage` | Contenido |
|---|---|
| `productos` | Catálogo (se crea con los 8 productos iniciales) |
| `carrito` | Productos agregados al carrito |
| `usuarios` | Cuentas registradas |
| `usuarioActivo` | Sesión actual |

Para volver al estado inicial, abre las herramientas del navegador (F12), ve a **Application → Local Storage**, elimina las claves y recarga la página.

### Estructura de `level-up-react`

```
level-up-react/
├── public/img/              → Imágenes de los productos y el logo
├── src/
│   ├── components/          → Header, Footer, ProductCard, Campo, RutaAdmin
│   ├── context/             → AuthContext, ProductosContext, CarritoContext
│   ├── data/                → productosIniciales.js, regiones.js
│   ├── pages/               → Home, Productos, Carrito, Login, Registro, Admin
│   ├── App.jsx              → Definición de rutas
│   ├── main.jsx             → Punto de entrada y proveedores de contexto
│   └── index.css            → Estilos propios (paleta oscura con acentos morados)
├── index.html
└── package.json
```

---

## Primera evaluación: sitio estático

Sitio de 4 vistas (Inicio, Registro, Inicio de sesión y Carrito) con HTML semántico, Bootstrap, CSS propio y JavaScript.

### Cómo abrirlo

No requiere instalación. Abre la carpeta del repositorio y haz doble clic en `index.html`, o usa la extensión Live Server de VS Code.

### Estructura

```
fullstack2/
├── assets/
│   ├── css/style.css
│   ├── js/                  → registro.js, login.js, carrito.js, carrito-comun.js
│   └── img/
├── index.html
├── registro.html
├── login.html
├── carrito.html
├── ERS.md                   → Especificación de Requisitos de Software
└── README.md
```

---

## Documentación

La especificación de requisitos de ambas etapas está en [ERS.md](ERS.md).

## Autor

Tomás Torres Delgado