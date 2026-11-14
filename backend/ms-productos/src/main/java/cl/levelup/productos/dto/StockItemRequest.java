package cl.levelup.productos.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Item de ajuste de stock. Se usa tanto para descontar como para reponer.
 */
public record StockItemRequest(

        @NotNull(message = "El productoId es obligatorio")
        Long productoId,

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor a 0")
        Integer cantidad) {
}
