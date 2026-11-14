package cl.levelup.productos.dto;

import cl.levelup.productos.model.Categoria;

public record CategoriaResponse(Long id, String nombre, Long cantidadProductos) {

    public static CategoriaResponse from(Categoria categoria, long cantidadProductos) {
        return new CategoriaResponse(categoria.getId(), categoria.getNombre(), cantidadProductos);
    }
}
