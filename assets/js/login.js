// ===== Referencias =====
const formLogin = document.getElementById("form-login");
const loginCorreo = document.getElementById("login-correo");
const loginPassword = document.getElementById("login-password");

// ===== Funciones auxiliares (mismas que en registro.js) =====
function mostrarError(input, idSpanError, mensaje) {
    document.getElementById(idSpanError).textContent = mensaje;
    input.classList.add("input-error");
}

function limpiarError(input, idSpanError) {
    document.getElementById(idSpanError).textContent = "";
    input.classList.remove("input-error");
}

// ===== Evento: al enviar el formulario de login =====
formLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let formularioValido = true;

    // ---- Validar que el correo no esté vacío y tenga formato válido ----
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(loginCorreo.value.trim())) {
        mostrarError(loginCorreo, "error-login-correo", "Ingresa un correo válido.");
        formularioValido = false;
    } else {
        limpiarError(loginCorreo, "error-login-correo");
    }

    // ---- Validar que la contraseña no esté vacía ----
    if (loginPassword.value.trim() === "") {
        mostrarError(loginPassword, "error-login-password", "Ingresa tu contraseña.");
        formularioValido = false;
    } else {
        limpiarError(loginPassword, "error-login-password");
    }

    if (!formularioValido) {
        return;
    }

    // ---- Buscar el usuario en localStorage ----
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioEncontrado = usuarios.find(function (usuario) {
        return usuario.correo === loginCorreo.value.trim();
    });

    // ---- Caso 1: el correo no existe ----
    if (!usuarioEncontrado) {
        mostrarError(loginCorreo, "error-login-correo", "No existe una cuenta con este correo.");
        return;
    }

    // ---- Caso 2: el correo existe, pero la contraseña no coincide ----
    if (usuarioEncontrado.password !== loginPassword.value) {
        mostrarError(loginPassword, "error-login-password", "Contraseña incorrecta.");
        return;
    }

    // ---- Caso 3: todo correcto, se guarda la sesión ----
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioEncontrado));

    alert("¡Bienvenido, " + usuarioEncontrado.nombre + "!");
    window.location.href = "index.html";
});