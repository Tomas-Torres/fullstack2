// ===== Función: obtener el carrito guardado (o vacío si no existe) =====
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

// ===== Función: guardar el carrito actualizado =====
function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ===== Función: actualizar el número "Cart (n)" del header =====
function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();

    // Sumamos las cantidades de todos los productos (no solo contamos líneas)
    const totalUnidades = carrito.reduce(function (acumulado, producto) {
        return acumulado + producto.cantidad;
    }, 0);

    const spanContador = document.getElementById("cart-count");
    if (spanContador) {
        spanContador.textContent = totalUnidades;
    }
}

// ===== Función: agregar un producto al carrito =====
function agregarAlCarrito(id, nombre, precio, imagen) {
    const carrito = obtenerCarrito();

    // Revisamos si el producto ya estaba en el carrito
    const productoExistente = carrito.find(function (item) {
        return item.id === id;
    });

    if (productoExistente) {
        // Si ya existía, solo sumamos 1 a su cantidad
        productoExistente.cantidad += 1;
    } else {
        // Si es nuevo, lo agregamos con cantidad 1
        carrito.push({
            id: id,
            nombre: nombre,
            precio: Number(precio),
            imagen: imagen,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();
}

// ===== Conectar todos los botones "Agregar al carrito" que existan en la página =====
document.querySelectorAll(".btn-agregar").forEach(function (boton) {
    boton.addEventListener("click", function () {
        const id = boton.dataset.id;
        const nombre = boton.dataset.nombre;
        const precio = boton.dataset.precio;
        const imagen = boton.dataset.imagen;

        agregarAlCarrito(id, nombre, precio, imagen);
        alert(nombre + " se agregó al carrito.");
    });
});

// ===== Al cargar cualquier página, actualizar el contador del header =====
actualizarContadorCarrito();