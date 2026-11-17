export const productosIniciales = [
  {
    id: 1, categoriaId: 1, nombre: 'Catan', categoria: 'Juegos de Mesa', atributo: '3-4 jugadores',
    precio: 29990, imagen: '/img/catan.png', stock: 10, oferta: 0,
    descripcion: 'El clásico juego de estrategia donde comercias recursos, construyes asentamientos y colonizas la isla de Catan. Ideal para 3 o 4 jugadores.',
  },
  {
    id: 2, categoriaId: 1, nombre: 'Carcassonne', categoria: 'Juegos de Mesa', atributo: '2-5 jugadores',
    precio: 24990, imagen: '/img/Carcassonne.webp', stock: 10, oferta: 15,
    descripcion: 'Juego de colocación de losetas donde creas ciudades, caminos y campos para reclamar territorios con tus seguidores. Para 2 a 5 jugadores.',
  },
  {
    id: 3, categoriaId: 2, nombre: 'Controlador Xbox Series X', categoria: 'Accesorios', atributo: 'Inalámbrico',
    precio: 59990, imagen: '/img/control_xbox.png', stock: 10, oferta: 0,
    descripcion: 'Mando inalámbrico oficial de Xbox con botón Share, gatillos hápticos y una ergonomía probada. Compatible con Series X|S, One y PC.',
  },
  {
    id: 4, categoriaId: 2, nombre: 'Audífonos HyperX Cloud II', categoria: 'Accesorios', atributo: 'Micrófono desmontable',
    precio: 79990, imagen: '/img/Audífonos_HyperX_Cloud_II.jpg', stock: 10, oferta: 20,
    descripcion: 'Audífonos gamer con sonido envolvente 7.1, almohadillas de memory foam y micrófono desmontable con cancelación de ruido.',
  },
  {
    id: 5, categoriaId: 3, nombre: 'GTA6 (Versión Digital)', categoria: 'Videojuegos', atributo: 'Sin lector de discos',
    precio: 429990, imagen: '/img/gta_6.webp', stock: 0, oferta: 0,
    descripcion: 'La esperada secuela de la saga GTA en versión digital. Cupo disponible limitado; por el momento sin stock.',
  },
  {
    id: 6, categoriaId: 4, nombre: 'PC Gamer ASUS ROG Strix', categoria: 'Computadores Gamers', atributo: 'Alto rendimiento',
    precio: 1299990, imagen: '/img/PC_Gamer_ASUS_ROG_Strix.png', stock: 5, oferta: 0,
    descripcion: 'Computador gamer de alto rendimiento con placa ROG, refrigeración avanzada y tarjeta de video de última generación para AAA sin sacrificios.',
  },
  {
    id: 7, categoriaId: 5, nombre: 'Silla Gamer Secretlab Titan', categoria: 'Sillas Gamers', atributo: 'Soporte ergonómico',
    precio: 349990, imagen: '/img/Silla_Gamer_Secretlab_Titan.webp', stock: 5, oferta: 0,
    descripcion: 'Silla ergonómica con soporte lumbar 4D ajustable, reposabrazos multidireccionales y tapizado de cuero sintético de alta durabilidad.',
  },
  {
    id: 8, categoriaId: 6, nombre: 'Mouse Logitech G502 HERO', categoria: 'Mouse', atributo: 'Sensor de alta precisión',
    precio: 49990, imagen: '/img/Mouse_Logitech_G502_HERO.png', stock: 10, oferta: 10,
    descripcion: 'Mouse gamer con sensor HERO 25K, 11 botones programables, contrapesos ajustables e iluminación RGB personalizable.',
  },
]

// Categorias del catalogo, con los mismos ids que usa ms-productos.
export const categoriasIniciales = [
  { id: 1, nombre: 'Juegos de Mesa' },
  { id: 2, nombre: 'Accesorios' },
  { id: 3, nombre: 'Videojuegos' },
  { id: 4, nombre: 'Computadores Gamers' },
  { id: 5, nombre: 'Sillas Gamers' },
  { id: 6, nombre: 'Mouse' },
]
