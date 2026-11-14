package cl.levelup.productos.service;

import cl.levelup.productos.dto.ProductoRequest;
import cl.levelup.productos.model.Categoria;
import cl.levelup.productos.model.Producto;
import cl.levelup.productos.repository.CategoriaRepository;
import cl.levelup.productos.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProductoServiceTest {

    private ProductoRepository productoRepository;
    private CategoriaRepository categoriaRepository;
    private ProductoService productoService;
    private Categoria categoria;

    @BeforeEach
    void setUp() {
        productoRepository = mock(ProductoRepository.class);
        categoriaRepository = mock(CategoriaRepository.class);
        productoService = new ProductoService(productoRepository, categoriaRepository);

        categoria = new Categoria("Accesorios");
        categoria.setId(1L);
    }

    private ProductoRequest request(Integer precio, Integer descuento, Integer stock) {
        return new ProductoRequest("Producto de prueba", 1L, "Inalámbrico", precio, descuento, stock,
                "/img/test.png", null);
    }

    private Producto producto(Long id, int precio, int descuento, int stock) {
        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre("Producto de prueba");
        producto.setCategoria(categoria);
        producto.setAtributo("Inalámbrico");
        producto.setPrecio(precio);
        producto.setDescuento(descuento);
        producto.setStock(stock);
        producto.setImagen("/img/test.png");
        producto.setActivo(true);
        return producto;
    }

    @Test
    void crearCalculaPrecioFinalYBanderaDeOferta() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.save(any(Producto.class))).thenAnswer(invocacion -> {
            Producto guardado = invocacion.getArgument(0);
            guardado.setId(7L);
            return guardado;
        });

        var respuesta = productoService.crear(request(29990, 15, 10));

        assertEquals(7L, respuesta.id());
        assertEquals(25492, respuesta.precioFinal());
        assertTrue(respuesta.enOferta());
        assertFalse(respuesta.sinStock());
        assertEquals("Accesorios", respuesta.categoriaNombre());
    }

    @Test
    void crearSinDescuentoMantieneElPrecioBase() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.save(any(Producto.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        var respuesta = productoService.crear(request(29990, null, 10));

        assertEquals(29990, respuesta.precioFinal());
        assertEquals(0, respuesta.descuento());
        assertFalse(respuesta.enOferta());
    }

    @Test
    void crearConCategoriaInexistenteFallaConBadRequest() {
        when(categoriaRepository.findById(99L)).thenReturn(Optional.empty());
        ProductoRequest solicitud = new ProductoRequest("Producto", 99L, "Atributo", 1000, 0, 1, "/img/x.png", null);

        assertThrows(IllegalArgumentException.class, () -> productoService.crear(solicitud));
        verify(productoRepository, never()).save(any(Producto.class));
    }

    @Test
    void obtenerInexistenteLanzaNoSuchElement() {
        when(productoRepository.findByIdAndActivoTrue(404L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> productoService.obtener(404L));
    }

    @Test
    void productoConStockCeroSeMarcaSinStock() {
        when(productoRepository.findByIdAndActivoTrue(5L)).thenReturn(Optional.of(producto(5L, 429990, 0, 0)));

        var respuesta = productoService.obtener(5L);

        assertTrue(respuesta.sinStock());
        assertFalse(respuesta.enOferta());
    }

    @Test
    void eliminarHaceBajaLogica() {
        Producto producto = producto(3L, 1000, 0, 5);
        when(productoRepository.findById(3L)).thenReturn(Optional.of(producto));

        productoService.eliminar(3L);

        assertFalse(producto.getActivo());
        verify(productoRepository).findById(3L);
    }

    @Test
    void eliminarInexistenteLanzaNoSuchElement() {
        when(productoRepository.findById(8L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> productoService.eliminar(8L));
    }

    @Test
    void actualizarCambiaLosDatosDelProducto() {
        Producto producto = producto(2L, 1000, 0, 5);
        when(productoRepository.findById(2L)).thenReturn(Optional.of(producto));
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.save(any(Producto.class))).thenAnswer(invocacion -> invocacion.getArgument(0));

        var respuesta = productoService.actualizar(2L, request(2000, 25, 9));

        assertEquals(2000, respuesta.precio());
        assertEquals(25, respuesta.descuento());
        assertEquals(1500, respuesta.precioFinal());
        assertEquals(9, respuesta.stock());
    }

    @Test
    void ofertasDevuelveProductosConDescuento() {
        when(productoRepository.findByActivoTrueAndDescuentoGreaterThanOrderByNombreAsc(0))
                .thenReturn(List.of(producto(1L, 79990, 20, 10)));

        var respuesta = productoService.ofertas();

        assertEquals(1, respuesta.size());
        assertTrue(respuesta.get(0).enOferta());
    }

    @Test
    void criticosRechazaUmbralNegativo() {
        assertThrows(IllegalArgumentException.class, () -> productoService.criticos(-1));
    }

    @Test
    void criticosDevuelveProductosBajoElUmbral() {
        when(productoRepository.findByActivoTrueAndStockLessThanEqualOrderByStockAsc(5))
                .thenReturn(List.of(producto(1L, 1000, 0, 0), producto(2L, 2000, 0, 5)));

        var respuesta = productoService.criticos(5);

        assertEquals(2, respuesta.size());
    }

    @Test
    void listarAplicaFiltrosYDevuelveLista() {
        when(productoRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(producto(1L, 1000, 0, 3)));

        var respuesta = productoService.listar("pro", 1L, true, false);

        assertEquals(1, respuesta.size());
    }

    @Test
    void listarPaginadoDevuelvePaginaYValidaParametros() {
        when(productoRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(producto(1L, 1000, 0, 3)), PageRequest.of(0, 10), 1));

        var respuesta = productoService.listarPaginado(null, null, null, null, 0, 10);

        assertEquals(1, respuesta.totalElements());
        assertEquals(1, respuesta.content().size());
        assertThrows(IllegalArgumentException.class,
                () -> productoService.listarPaginado(null, null, null, null, -1, 10));
        assertThrows(IllegalArgumentException.class,
                () -> productoService.listarPaginado(null, null, null, null, 0, 0));
    }
}
