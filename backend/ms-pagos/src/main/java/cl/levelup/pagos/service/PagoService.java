package cl.levelup.pagos.service;

import cl.levelup.pagos.dto.PagoRequest;
import cl.levelup.pagos.dto.PagoResponse;
import cl.levelup.pagos.exception.PagoDuplicadoException;
import cl.levelup.pagos.exception.PagoInvalidoException;
import cl.levelup.pagos.model.EstadoPago;
import cl.levelup.pagos.model.Pago;
import cl.levelup.pagos.repository.PagoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Simula el cobro de una orden con reglas deterministas. No existe pasarela
 * real y el numero completo de la tarjeta nunca se persiste ni se registra.
 */
@Service
@Transactional(readOnly = true)
public class PagoService {

    private static final Logger log = LoggerFactory.getLogger(PagoService.class);

    private static final Pattern TARJETA_VALIDA = Pattern.compile("\\d{16}");
    private static final String MOTIVO_FONDOS = "Fondos insuficientes";
    private static final String MOTIVO_TARJETA = "Tarjeta inválida";

    private final PagoRepository pagoRepository;

    public PagoService(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    /**
     * Registra un intento de cobro. Un rechazo es un resultado de negocio, no
     * un error HTTP.
     */
    @Transactional
    public PagoResponse registrar(PagoRequest request) {
        String numero = request.metodo().esTarjeta() ? validarNumeroTarjeta(request.numeroTarjeta()) : null;

        if (pagoRepository.existsByOrdenIdAndEstado(request.ordenId(), EstadoPago.APROBADO)) {
            throw new PagoDuplicadoException(request.ordenId());
        }

        Pago pago = new Pago();
        pago.setOrdenId(request.ordenId());
        pago.setMonto(request.monto());
        pago.setMetodo(request.metodo());
        pago.setCodigoTransaccion(UUID.randomUUID().toString());
        pago.setFecha(LocalDateTime.now());

        if (numero == null) {
            aprobar(pago);
        } else {
            pago.setUltimosDigitos(numero.substring(numero.length() - 4));
            decidirTarjeta(pago, numero);
        }

        Pago guardado = pagoRepository.save(pago);
        log.info("Pago {} de la orden {} quedo {}", guardado.getId(), guardado.getOrdenId(), guardado.getEstado());
        return PagoResponse.from(guardado);
    }

    public PagoResponse obtener(Long id) {
        return PagoResponse.from(buscar(id));
    }

    public List<PagoResponse> listarPorOrden(Long ordenId) {
        return pagoRepository.findByOrdenIdOrderByFechaDesc(ordenId).stream()
                .map(PagoResponse::from)
                .toList();
    }

    public List<PagoResponse> listar(EstadoPago estado) {
        List<Pago> pagos = estado == null
                ? pagoRepository.findAll(Sort.by(Sort.Direction.DESC, "fecha"))
                : pagoRepository.findByEstadoOrderByFechaDesc(estado);
        return pagos.stream()
                .map(PagoResponse::from)
                .toList();
    }

    private Pago buscar(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Pago no encontrado con id " + id));
    }

    /**
     * Quita los espacios y exige exactamente 16 digitos numericos.
     */
    private String validarNumeroTarjeta(String numeroTarjeta) {
        if (numeroTarjeta == null || numeroTarjeta.isBlank()) {
            throw new PagoInvalidoException("numeroTarjeta",
                    "El numero de tarjeta es obligatorio para pagos con tarjeta");
        }
        String limpio = numeroTarjeta.replaceAll("\\s", "");
        if (!TARJETA_VALIDA.matcher(limpio).matches()) {
            throw new PagoInvalidoException("numeroTarjeta",
                    "El numero de tarjeta debe tener 16 digitos numericos");
        }
        return limpio;
    }

    private void decidirTarjeta(Pago pago, String numero) {
        if (numero.endsWith("0000")) {
            rechazar(pago, MOTIVO_FONDOS);
        } else if (numero.endsWith("1111")) {
            rechazar(pago, MOTIVO_TARJETA);
        } else {
            aprobar(pago);
        }
    }

    private void aprobar(Pago pago) {
        pago.setEstado(EstadoPago.APROBADO);
        pago.setMotivoRechazo(null);
    }

    private void rechazar(Pago pago, String motivo) {
        pago.setEstado(EstadoPago.RECHAZADO);
        pago.setMotivoRechazo(motivo);
    }
}
