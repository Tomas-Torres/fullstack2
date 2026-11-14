package cl.levelup.login.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Alta de usuario realizada por un ADMIN. Permite indicar rol y estado.
 */
public record UsuarioCreateRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
        @Pattern(regexp = Validacion.NOMBRE_REGEX, message = Validacion.NOMBRE_MENSAJE)
        String nombre,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
        String correo,

        @NotBlank(message = "La contraseña es obligatoria")
        @Pattern(regexp = Validacion.PASSWORD_REGEX, message = Validacion.PASSWORD_MENSAJE)
        String password,

        @Pattern(regexp = Validacion.TELEFONO_REGEX, message = Validacion.TELEFONO_MENSAJE)
        String telefono,

        @NotBlank(message = "La región es obligatoria")
        @Size(max = 50, message = "La región no puede superar los 50 caracteres")
        String region,

        @NotBlank(message = "La comuna es obligatoria")
        @Size(max = 50, message = "La comuna no puede superar los 50 caracteres")
        String comuna,

        @Pattern(regexp = Validacion.ROL_REGEX, message = Validacion.ROL_MENSAJE)
        String rol,

        Boolean activo) {
}
