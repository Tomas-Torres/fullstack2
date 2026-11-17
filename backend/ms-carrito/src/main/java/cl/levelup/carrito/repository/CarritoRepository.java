package cl.levelup.carrito.repository;

import cl.levelup.carrito.model.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    Optional<Carrito> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioId(Long usuarioId);
}
