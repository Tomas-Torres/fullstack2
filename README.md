# Level-Up Gamer 🎮

Tienda online de productos para gamers, desarrollada como Evaluación Formativa N.° 1 del ramo **DSY1104 – Desarrollo Fullstack II** (Duoc UC).

## Descripción

Sitio web de 4 vistas (Inicio, Registro, Inicio de sesión y Carrito de compras), desarrollado con HTML5 semántico, Bootstrap 5 + CSS propio, y JavaScript con validaciones de formularios y persistencia de datos mediante `localStorage`.

## Cómo abrir el proyecto

No requiere instalación ni servidor. Solo necesitas un navegador web (Chrome, Edge o Firefox).

1. Clona o descarga este repositorio.
2. Abre la carpeta `fullstack2` en tu explorador de archivos.
3. Haz doble clic en `index.html` para abrirlo directamente en tu navegador.

   **Alternativa recomendada (VS Code):** abre la carpeta en VS Code, haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"** (o "Show Preview"), para evitar problemas de rutas relativas.

## Estructura del proyecto

```
fullstack2/
├── assets/
│   ├── css/
│   │   └── style.css        → Estilos del sitio
│   ├── js/
│   │   ├── registro.js      → Validaciones del formulario de registro
│   │   ├── login.js         → Validación de inicio de sesión
│   │   ├── carrito.js       → Lógica de la vista carrito
│   │   └── carrito-comun.js → Lógica de carrito compartida (contador, agregar productos)
│   └── img/                 → Imágenes del sitio
├── index.html                → Página de inicio (portada + catálogo)
├── registro.html              → Registro de usuario
├── login.html                  → Inicio de sesión
├── carrito.html                → Carrito de compras
├── ERS.md                      → Especificación de Requisitos de Software
└── README.md                   → Este archivo
```

## Funcionalidades principales

- Registro de usuario con validaciones (nombre, correo, contraseña segura, teléfono, región/comuna).
- Inicio de sesión con verificación de credenciales.
- Catálogo de 8 productos gamer.
- Carrito de compras: agregar productos, modificar cantidades, cupón de descuento y pago simulado.
- Persistencia de usuarios y carrito en `localStorage` (los datos se mantienen al recargar la página).

## Tecnologías utilizadas

- HTML5
- CSS3 + Bootstrap 5
- JavaScript (vanilla)
- Git y GitHub

## Autor

Tomás Torres