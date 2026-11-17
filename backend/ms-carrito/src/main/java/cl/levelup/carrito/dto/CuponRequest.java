package cl.levelup.carrito.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Codigo de cupon enviado por el cliente.
 */
public record CuponRequest(

        @NotBlank(message = "El codigo del cupon es obligatorio")
        String codigo) {
}
