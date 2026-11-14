package cl.levelup.productos.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Datos de entrada para crear o actualizar un producto.
 */
public record ProductoRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 60, message = "El nombre no puede superar los 60 caracteres")
        String nombre,

        @NotNull(message = "La categoria es obligatoria")
        Long categoriaId,

        @NotBlank(message = "El atributo es obligatorio")
        @Size(max = 120, message = "El atributo no puede superar los 120 caracteres")
        String atributo,

        @NotNull(message = "El precio es obligatorio")
        @Positive(message = "El precio debe ser mayor a 0")
        Integer precio,

        @Min(value = 0, message = "El descuento minimo es 0")
        @Max(value = 90, message = "El descuento maximo es 90")
        Integer descuento,

        @NotNull(message = "El stock es obligatorio")
        @PositiveOrZero(message = "El stock no puede ser negativo")
        Integer stock,

        @NotBlank(message = "La imagen es obligatoria")
        @Pattern(regexp = "^(/|https?://).+", message = "La imagen debe empezar con / o con http")
        String imagen,

        Boolean activo) {
}
