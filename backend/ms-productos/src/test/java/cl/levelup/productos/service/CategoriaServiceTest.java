package cl.levelup.productos.service;

import cl.levelup.productos.dto.CategoriaRequest;
import cl.levelup.productos.exception.CategoriaConProductosException;
import cl.levelup.productos.exception.CategoriaDuplicadaException;
import cl.levelup.productos.model.Categoria;
import cl.levelup.productos.repository.CategoriaRepository;
import cl.levelup.productos.repository.CategoriaResumen;
import cl.levelup.productos.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CategoriaServiceTest {

    private CategoriaRepository categoriaRepository;
    private ProductoRepository productoRepository;
    private CategoriaService categoriaService;

    @BeforeEach
    void setUp() {
        categoriaRepository = mock(CategoriaRepository.class);
        productoRepository = mock(ProductoRepository.class);
        categoriaService = new CategoriaService(categoriaRepository, productoRepository);
    }

    private Categoria categoria(Long id, String nombre) {
        Categoria categoria = new Categoria(nombre);
        categoria.setId(id);
        return categoria;
    }

    private CategoriaResumen resumen(Long id, String nombre, Long cantidad) {
        return new CategoriaResumen() {
            @Override
            public Long getId() {
                return id;
            }

            @Override
            public String getNombre() {
                return nombre;
            }

            @Override
            public Long getCantidad() {
                return cantidad;
            }
        };
    }

    @Test
    void listarIncluyeLaCantidadDeProductos() {
        when(categoriaRepository.listarResumen())
                .thenReturn(List.of(resumen(1L, "Accesorios", 2L), resumen(2L, "Mouse", 1L)));

        var respuesta = categoriaService.listar();

        assertEquals(2, respuesta.size());
        assertEquals(2L, respuesta.get(0).cantidadProductos());
        assertEquals("Mouse", respuesta.get(1).nombre());
    }

    @Test
    void obtenerDevuelveCategoriaConConteo() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria(1L, "Accesorios")));
        when(productoRepository.countByCategoriaIdAndActivoTrue(1L)).thenReturn(2L);

        var respuesta = categoriaService.obtener(1L);

        assertEquals("Accesorios", respuesta.nombre());
        assertEquals(2L, respuesta.cantidadProductos());
    }

    @Test
    void obtenerInexistenteLanzaNoSuchElement() {
        when(categoriaRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> categoriaService.obtener(9L));
    }

    @Test
    void crearGuardaLaCategoria() {
        when(categoriaRepository.existsByNombreIgnoreCase("Mouse")).thenReturn(false);
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(invocacion -> {
            Categoria guardada = invocacion.getArgument(0);
            guardada.setId(3L);
            return guardada;
        });

        var respuesta = categoriaService.crear(new CategoriaRequest("  Mouse  "));

        assertEquals(3L, respuesta.id());
        assertEquals("Mouse", respuesta.nombre());
        assertEquals(0L, respuesta.cantidadProductos());
    }

    @Test
    void crearDuplicadaFallaConConflicto() {
        when(categoriaRepository.existsByNombreIgnoreCase("Mouse")).thenReturn(true);

        assertThrows(CategoriaDuplicadaException.class, () -> categoriaService.crear(new CategoriaRequest("Mouse")));
        verify(categoriaRepository, never()).save(any(Categoria.class));
    }

    @Test
    void actualizarCambiaElNombre() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria(1L, "Mouse")));
        when(categoriaRepository.existsByNombreIgnoreCaseAndIdNot("Periféricos", 1L)).thenReturn(false);
        when(productoRepository.countByCategoriaIdAndActivoTrue(1L)).thenReturn(4L);

        var respuesta = categoriaService.actualizar(1L, new CategoriaRequest("Periféricos"));

        assertEquals("Periféricos", respuesta.nombre());
        assertEquals(4L, respuesta.cantidadProductos());
    }

    @Test
    void actualizarConNombreDuplicadoFalla() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria(1L, "Mouse")));
        when(categoriaRepository.existsByNombreIgnoreCaseAndIdNot("Accesorios", 1L)).thenReturn(true);

        assertThrows(CategoriaDuplicadaException.class,
                () -> categoriaService.actualizar(1L, new CategoriaRequest("Accesorios")));
    }

    @Test
    void eliminarCategoriaConProductosFallaConConflicto() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria(1L, "Accesorios")));
        when(productoRepository.existsByCategoriaId(1L)).thenReturn(true);

        assertThrows(CategoriaConProductosException.class, () -> categoriaService.eliminar(1L));
        verify(categoriaRepository, never()).delete(any(Categoria.class));
    }

    @Test
    void eliminarCategoriaSinProductosFunciona() {
        Categoria categoria = categoria(2L, "Mouse");
        when(categoriaRepository.findById(2L)).thenReturn(Optional.of(categoria));
        when(productoRepository.existsByCategoriaId(2L)).thenReturn(false);

        categoriaService.eliminar(2L);

        verify(categoriaRepository).delete(categoria);
    }
}
