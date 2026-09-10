//DATOS: comunas agrupadas por región
const comunasPorRegion = {
    metropolitana: ["Santiago", "Puente Alto", "Maipú", "Providencia"],
    valparaiso: ["Valparaíso", "Viña del Mar", "Quilpué"],
    biobio: ["Concepción", "Talcahuano", "Los Ángeles"]
};

// ===== Referencias a los elementos del HTML =====
// document.getElementById busca un elemento por su "id" y lo guarda en una variable.
const selectRegion = document.getElementById("region");
const selectComuna = document.getElementById("comuna");

// ===== Evento: cuando el usuario CAMBIA la región =====
selectRegion.addEventListener("change", function () {
    const regionElegida = selectRegion.value; 

    // Reiniciamos el select de comuna, dejando solo la opción inicial
    selectComuna.innerHTML = '<option value="">-- Selecciona tu comuna --</option>';

    // Si eligieron una región válida, buscamos sus comunas y las agregamos
    if (regionElegida && comunasPorRegion[regionElegida]) {
        comunasPorRegion[regionElegida].forEach(function (comuna) {
            const nuevaOpcion = document.createElement("option");
            nuevaOpcion.value = comuna.toLowerCase(); // ej: "santiago"
            nuevaOpcion.textContent = comuna;         // ej: "Santiago" (lo que se ve xd)
            selectComuna.appendChild(nuevaOpcion);
        });
    }
});

// ===== Referencias a los campos del formulario =====
const form = document.getElementById("form-registro");
const inputNombre = document.getElementById("nombre");
const inputCorreo = document.getElementById("correo");
const inputConfirmarCorreo = document.getElementById("confirmar-correo");
const inputPassword = document.getElementById("password");
const inputConfirmarPassword = document.getElementById("confirmar-password");
const inputTelefono = document.getElementById("telefono");

// ===== Función auxiliar: mostrar un error en pantalla =====
function mostrarError(input, idSpanError, mensaje) {
    document.getElementById(idSpanError).textContent = mensaje;
    input.classList.add("input-error"); // le agrega el borde rojo que definimos en el CSS
}

// ===== Función auxiliar: limpiar el error (cuando el campo SÍ está bien) =====
function limpiarError(input, idSpanError) {
    document.getElementById(idSpanError).textContent = "";
    input.classList.remove("input-error");
}

// ===== Evento principal: al enviar el formulario =====
form.addEventListener("submit", function (evento) {
    evento.preventDefault(); // evita que la página se recargue o se envíe de verdad

    let formularioValido = true; // "bandera": empieza en true, se pone false si algo falla

    // ---- Validar NOMBRE ----
    const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{1,50}$/;
    if (!regexNombre.test(inputNombre.value.trim())) {
        mostrarError(inputNombre, "error-nombre", "Solo letras y espacios, máximo 50 caracteres.");
        formularioValido = false;
    } else {
        limpiarError(inputNombre, "error-nombre");
    }

    // ---- Validar CORREO (formato) ----
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(inputCorreo.value.trim())) {
        mostrarError(inputCorreo, "error-correo", "Ingresa un correo con formato válido.");
        formularioValido = false;
    } else {
        limpiarError(inputCorreo, "error-correo");
    }

    // ---- Validar CONFIRMAR CORREO (debe coincidir) ----
    if (inputConfirmarCorreo.value.trim() !== inputCorreo.value.trim()) {
        mostrarError(inputConfirmarCorreo, "error-confirmar-correo", "Los correos no coinciden.");
        formularioValido = false;
    } else {
        limpiarError(inputConfirmarCorreo, "error-confirmar-correo");
    }

    // ---- Validar CONTRASEÑA ----
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!.*])[A-Za-z\d@#$%!.*]{8,}$/;
    if (!regexPassword.test(inputPassword.value)) {
        mostrarError(inputPassword, "error-password", "Debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo.");
        formularioValido = false;
    } else {
        limpiarError(inputPassword, "error-password");
    }

    // ---- Validar CONFIRMAR CONTRASEÑA ----
    if (inputConfirmarPassword.value !== inputPassword.value) {
        mostrarError(inputConfirmarPassword, "error-confirmar-password", "Las contraseñas no coinciden.");
        formularioValido = false;
    } else {
        limpiarError(inputConfirmarPassword, "error-confirmar-password");
    }

    // ---- Validar TELÉFONO (opcional) ----
    const regexTelefono = /^(\+56\s?9\s?\d{4}\s?\d{4}|9\d{8})$/;
    const telefonoValor = inputTelefono.value.trim();
    if (telefonoValor !== "" && !regexTelefono.test(telefonoValor)) {
        mostrarError(inputTelefono, "error-telefono", "Formato inválido. Ej: +56 9 1234 5678.");
        formularioValido = false;
    } else {
        limpiarError(inputTelefono, "error-telefono");
    }

    // ---- Validar REGIÓN ----
    if (selectRegion.value === "") {
        mostrarError(selectRegion, "error-region", "Debes seleccionar una región.");
        formularioValido = false;
    } else {
        limpiarError(selectRegion, "error-region");
    }

    // ---- Validar COMUNA ----
    if (selectComuna.value === "") {
        mostrarError(selectComuna, "error-comuna", "Debes seleccionar una comuna.");
        formularioValido = false;
    } else {
        limpiarError(selectComuna, "error-comuna");
    }

    // Si algún campo falló, no seguimos (no se guarda nada)
    if (!formularioValido) {
        return;
    }

    // ---- Validar que el correo NO esté ya registrado ----
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const correoExiste = usuarios.some(function (usuario) {
        return usuario.correo === inputCorreo.value.trim();
    });

    if (correoExiste) {
        mostrarError(inputCorreo, "error-correo", "Este correo ya está registrado.");
        return;
    }

    // ---- Todo OK: guardamos el nuevo usuario ----
    const nuevoUsuario = {
        nombre: inputNombre.value.trim(),
        correo: inputCorreo.value.trim(),
        password: inputPassword.value,
        telefono: telefonoValor,
        region: selectRegion.value,
        comuna: selectComuna.value
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
    window.location.href = "login.html";
});