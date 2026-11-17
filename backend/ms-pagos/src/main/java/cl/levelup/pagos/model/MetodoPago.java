package cl.levelup.pagos.model;

/**
 * Metodos de pago aceptados por la simulacion de cobro.
 */
public enum MetodoPago {

    TARJETA_CREDITO,
    TARJETA_DEBITO,
    TRANSFERENCIA;

    /**
     * Indica si el metodo exige numero de tarjeta y guarda los ultimos digitos.
     */
    public boolean esTarjeta() {
        return this == TARJETA_CREDITO || this == TARJETA_DEBITO;
    }
}
