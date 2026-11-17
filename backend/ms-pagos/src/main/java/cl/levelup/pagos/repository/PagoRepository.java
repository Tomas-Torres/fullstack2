package cl.levelup.pagos.repository;

import cl.levelup.pagos.model.EstadoPago;
import cl.levelup.pagos.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    boolean existsByOrdenIdAndEstado(Long ordenId, EstadoPago estado);

    List<Pago> findByOrdenIdOrderByFechaDesc(Long ordenId);

    List<Pago> findByEstadoOrderByFechaDesc(EstadoPago estado);
}
