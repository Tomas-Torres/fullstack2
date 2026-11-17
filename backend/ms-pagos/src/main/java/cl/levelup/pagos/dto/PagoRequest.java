package cl.levelup.pagos.dto;

import cl.levelup.pagos.model.MetodoPago;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Datos para registrar un intento de cobro. El numero de tarjeta solo se usa
 * en memoria para decidir el resultado y extraer los ultimos digitos.
 */
public record PagoRequest(

        @NotNull(message = "La orden es obligatoria")
        Long ordenId,

        @NotNull(message = "El monto es obligatorio")
        @Positive(message = "El monto debe ser mayor a 0")
        Integer monto,

        @NotNull(message = "El metodo de pago es obligatorio")
        MetodoPago metodo,

        String numeroTarjeta) {
}
