// ===== Referencias =====
const listaCarrito = document.getElementById("lista-carrito");
const totalCarritoEl = document.getElementById("total-carrito");

// ===== Función: formatear números como precio chileno ($1.234) =====
function formatearPrecio(numero) {
    return "$" + numero.toLocaleString("es-CL");
}

// ===== Función principal: dibujar el carrito completo en pantalla =====
function renderizarCarrito() {

    // ===== Función: aumentar o disminuir la cantidad de un producto =====
function cambiarCantidad(id, cambio) {
    const carrito = obtenerCarrito();

    const producto = carrito.find(function (item) {
        return item.id === id;
    });

    if (!producto) return; // por seguridad, si no lo encuentra, no hace nada

    producto.cantidad += cambio; // cambio será +1 o -1

    if (producto.cantidad <= 0) {
        // Si llega a 0 (o menos), lo eliminamos del carrito
        const nuevoCarrito = carrito.filter(function (item) {
            return item.id !== id;
        });
        guardarCarrito(nuevoCarrito);
    } else {
        guardarCarrito(carrito);
    }

    actualizarContadorCarrito(); // esta función viene de carrito-comun.js
    renderizarCarrito(); // volvemos a dibujar todo con los datos actualizados
}

// ===== Función: conectar los botones + y − que se dibujaron dinámicamente =====
function activarBotonesCantidad() {
    document.querySelectorAll(".btn-sumar").forEach(function (boton) {
        boton.addEventListener("click", function () {
            cambiarCantidad(boton.dataset.id, 1);
        });
    });

    document.querySelectorAll(".btn-restar").forEach(function (boton) {
        boton.addEventListener("click", function () {
            cambiarCantidad(boton.dataset.id, -1);
        });
    });
}

    const carrito = obtenerCarrito(); // esta función viene de carrito-comun.js

    // Caso: carrito vacío
    if (carrito.length === 0) {
        listaCarrito.innerHTML = `
            <div class="carrito-vacio">
                <p>Tu carrito está vacío.</p>
                <a href="index.html#catalogo" class="btn btn-morado">Ver catálogo</a>
            </div>
        `;
        totalCarritoEl.textContent = formatearPrecio(0);
        return;
    }

    // Si hay productos, vamos armando el HTML de cada uno
    let html = "";
    let total = 0;

    carrito.forEach(function (producto) {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        html += `
            <div class="producto-carrito">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <div class="info-producto">
                    <h3>${producto.nombre}</h3>
                    <p>${formatearPrecio(producto.precio)} c/u</p>
                </div>
                <div class="control-cantidad">
                    <button class="btn-restar" data-id="${producto.id}">−</button>
                    <span>${producto.cantidad}</span>
                    <button class="btn-sumar" data-id="${producto.id}">+</button>
                </div>
                <strong>${formatearPrecio(subtotal)}</strong>
            </div>
        `;
    });

    listaCarrito.innerHTML = html;
    totalCarritoEl.textContent = formatearPrecio(total);

    // Después de dibujar, hay que "activar" los botones + y - (se explica abajo)
    activarBotonesCantidad();
}

// ===== Cupón de descuento =====
const inputCupon = document.getElementById("cupon");
const btnAplicarCupon = document.getElementById("btn-aplicar-cupon");

const cuponesValidos = {
    "LEVELUP10": 0.10,   // 10% de descuento
    "GAMER20": 0.20      // 20% de descuento
};

btnAplicarCupon.addEventListener("click", function () {
    const codigo = inputCupon.value.trim().toUpperCase();
    const spanError = document.getElementById("error-cupon");

    if (cuponesValidos[codigo]) {
        const carrito = obtenerCarrito();
        const totalActual = carrito.reduce(function (acumulado, producto) {
            return acumulado + (producto.precio * producto.cantidad);
        }, 0);

        const descuento = totalActual * cuponesValidos[codigo];
        const totalConDescuento = totalActual - descuento;

        totalCarritoEl.textContent = formatearPrecio(totalConDescuento);
        spanError.textContent = "";
        spanError.style.color = "lightgreen";
        spanError.textContent = "¡Cupón aplicado! Descuento del " + (cuponesValidos[codigo] * 100) + "%.";
    } else {
        spanError.style.color = "#ff5c5c";
        spanError.textContent = "Cupón inválido.";
    }
});

// ===== Botón Pagar =====
const btnPagar = document.getElementById("btn-pagar");

btnPagar.addEventListener("click", function () {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de pagar.");
        return;
    }

    alert("¡Compra simulada con éxito! Gracias por tu compra en Level-Up Gamer.");
    guardarCarrito([]); // vaciamos el carrito
    actualizarContadorCarrito();
    renderizarCarrito();
});

// ===== Al cargar la página, dibujamos el carrito por primera vez =====
renderizarCarrito();