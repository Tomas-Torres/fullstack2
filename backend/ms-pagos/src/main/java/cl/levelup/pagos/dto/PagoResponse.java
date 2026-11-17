package cl.levelup.pagos.dto;

import cl.levelup.pagos.model.EstadoPago;
import cl.levelup.pagos.model.MetodoPago;
import cl.levelup.pagos.model.Pago;

import java.time.LocalDateTime;

/**
 * Respuesta de un pago. No incluye el numero de tarjeta: solo los ultimos
 * cuatro digitos cuando el metodo es tarjeta.
 */
public record PagoResponse(
        Long id,
        Long ordenId,
        Integer monto,
        MetodoPago metodo,
        String ultimosDigitos,
        EstadoPago estado,
        String codigoTransaccion,
        String motivoRechazo,
        LocalDateTime fecha) {

    public static PagoResponse from(Pago pago) {
        return new PagoResponse(
                pago.getId(),
                pago.getOrdenId(),
                pago.getMonto(),
                pago.getMetodo(),
                pago.getUltimosDigitos(),
                pago.getEstado(),
                pago.getCodigoTransaccion(),
                pago.getMotivoRechazo(),
                pago.getFecha());
    }
}
