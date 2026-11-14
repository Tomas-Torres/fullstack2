package cl.levelup.productos.repository;

import cl.levelup.productos.model.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {

    Optional<Producto> findByIdAndActivoTrue(Long id);

    List<Producto> findByActivoTrueAndDescuentoGreaterThanOrderByNombreAsc(Integer descuento);

    List<Producto> findByActivoTrueAndStockLessThanEqualOrderByStockAsc(Integer umbral);

    boolean existsByCategoriaId(Long categoriaId);

    long countByCategoriaIdAndActivoTrue(Long categoriaId);

    /**
     * Bloquea la fila del producto para actualizar stock de forma segura.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.id = :id")
    Optional<Producto> buscarParaActualizar(@Param("id") Long id);
}
