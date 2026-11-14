package cl.levelup.productos.repository;

/**
 * Proyeccion con el nombre de la categoria y la cantidad de productos activos.
 */
public interface CategoriaResumen {

    Long getId();

    String getNombre();

    Long getCantidad();
}
