package cl.levelup.login.dto;

import java.util.regex.Pattern;

/**
 * Reglas de validacion compartidas por los DTO de entrada y por las
 * actualizaciones parciales que se validan en el servicio.
 */
public final class Validacion {

    public static final String NOMBRE_REGEX = "^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$";
    public static final String PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%!.*]).{8,}$";
    public static final String TELEFONO_REGEX = "^$|^(\\+56)?9\\d{8}$";
    public static final String ROL_REGEX = "CLIENTE|ADMIN";

    public static final String NOMBRE_MENSAJE = "El nombre solo puede contener letras y espacios";
    public static final String PASSWORD_MENSAJE =
            "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@#$%!.*)";
    public static final String TELEFONO_MENSAJE = "El teléfono debe ser un móvil chileno, por ejemplo +56912345678";
    public static final String ROL_MENSAJE = "El rol debe ser CLIENTE o ADMIN";

    private static final Pattern PASSWORD = Pattern.compile(PASSWORD_REGEX);

    private Validacion() {
    }

    /**
     * Valida una contrasena que llega en una actualizacion parcial, donde las
     * anotaciones de Bean Validation no se aplican porque el campo es opcional.
     */
    public static void validarPassword(String password) {
        if (password == null || !PASSWORD.matcher(password).matches()) {
            throw new IllegalArgumentException(PASSWORD_MENSAJE);
        }
    }
}
