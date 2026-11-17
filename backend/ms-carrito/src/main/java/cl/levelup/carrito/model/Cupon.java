package cl.levelup.carrito.model;

import java.util.Locale;
import java.util.Optional;

/**
 * Cupones vigentes de la tienda. El porcentaje se guarda como entero para que
 * el calculo del descuento no dependa de decimales binarios.
 */
public enum Cupon {

    LEVELUP10(10),
    GAMER20(20);

    private final int porcentaje;

    Cupon(int porcentaje) {
        this.porcentaje = porcentaje;
    }

    public int getPorcentaje() {
        return porcentaje;
    }

    /**
     * Descuento en pesos CLP, redondeado al peso mas cercano.
     */
    public int descuento(int subtotal) {
        return (int) Math.round(subtotal * porcentaje / 100.0);
    }

    /**
     * Busca un cupon sin distinguir mayusculas ni espacios.
     */
    public static Optional<Cupon> desde(String codigo) {
        if (codigo == null) {
            return Optional.empty();
        }
        String limpio = codigo.trim().toUpperCase(Locale.ROOT);
        for (Cupon cupon : values()) {
            if (cupon.name().equals(limpio)) {
                return Optional.of(cupon);
            }
        }
        return Optional.empty();
    }
}
