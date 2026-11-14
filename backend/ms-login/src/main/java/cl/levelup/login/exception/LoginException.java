package cl.levelup.login.exception;

import org.springframework.http.HttpStatus;

/**
 * Error de negocio del login con su campo asociado. Se traduce a
 * {campo, mensaje} para que el frontend pueda marcar el input correcto.
 */
public class LoginException extends RuntimeException {

    private final HttpStatus estado;
    private final String campo;

    private LoginException(HttpStatus estado, String campo, String mensaje) {
        super(mensaje);
        this.estado = estado;
        this.campo = campo;
    }

    public static LoginException correoNoExiste() {
        return new LoginException(HttpStatus.NOT_FOUND, "correo",
                "No existe una cuenta con este correo.");
    }

    public static LoginException passwordIncorrecta() {
        return new LoginException(HttpStatus.UNAUTHORIZED, "password",
                "Contraseña incorrecta.");
    }

    public static LoginException cuentaDesactivada() {
        return new LoginException(HttpStatus.FORBIDDEN, "correo",
                "Tu cuenta está desactivada.");
    }

    public HttpStatus getEstado() {
        return estado;
    }

    public String getCampo() {
        return campo;
    }
}
