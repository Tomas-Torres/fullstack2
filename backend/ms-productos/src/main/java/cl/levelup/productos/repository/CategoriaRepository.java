package cl.levelup.productos.repository;

import cl.levelup.productos.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    @Query("""
            select c.id as id, c.nombre as nombre, count(p.id) as cantidad
              from Categoria c
              left join Producto p on p.categoria.id = c.id and p.activo = true
             group by c.id, c.nombre
             order by c.nombre
            """)
    List<CategoriaResumen> listarResumen();
}
