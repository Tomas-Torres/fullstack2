package cl.levelup.carrito.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Cambio de cantidad de un item. El valor 0 elimina el producto del carrito.
 */
public record CantidadRequest(

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 0, message = "La cantidad no puede ser negativa")
        Integer cantidad) {
}
