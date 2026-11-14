package cl.levelup.productos.service;

import cl.levelup.productos.dto.StockItemRequest;
import cl.levelup.productos.exception.StockInsuficienteException;
import cl.levelup.productos.model.Categoria;
import cl.levelup.productos.model.Producto;
import cl.levelup.productos.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class StockServiceTest {

    private ProductoRepository productoRepository;
    private StockService stockService;

    @BeforeEach
    void setUp() {
        productoRepository = mock(ProductoRepository.class);
        stockService = new StockService(productoRepository);
    }

    private Producto producto(Long id, int stock, boolean activo) {
        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre("Producto " + id);
        producto.setCategoria(new Categoria("Accesorios"));
        producto.setAtributo("Atributo");
        producto.setPrecio(1000);
        producto.setDescuento(0);
        producto.setStock(stock);
        producto.setImagen("/img/test.png");
        producto.setActivo(activo);
        return producto;
    }

    @Test
    void descontarReduceElStockDisponible() {
        Producto producto = producto(1L, 10, true);
        when(productoRepository.buscarParaActualizar(1L)).thenReturn(Optional.of(producto));

        stockService.descontar(List.of(new StockItemRequest(1L, 3)));

        assertEquals(7, producto.getStock());
    }

    @Test
    void descontarAgrupaLineasDelMismoProducto() {
        Producto producto = producto(1L, 10, true);
        when(productoRepository.buscarParaActualizar(1L)).thenReturn(Optional.of(producto));

        stockService.descontar(List.of(new StockItemRequest(1L, 2), new StockItemRequest(1L, 3)));

        assertEquals(5, producto.getStock());
    }

    @Test
    void descontarConStockInsuficienteNoTocaLosDemasProductos() {
        Producto primero = producto(1L, 1, true);
        Producto segundo = producto(2L, 10, true);
        when(productoRepository.buscarParaActualizar(1L)).thenReturn(Optional.of(primero));
        when(productoRepository.buscarParaActualizar(2L)).thenReturn(Optional.of(segundo));

        assertThrows(StockInsuficienteException.class,
                () -> stockService.descontar(List.of(new StockItemRequest(1L, 5), new StockItemRequest(2L, 1))));

        assertEquals(10, segundo.getStock());
    }

    @Test
    void descontarProductoInexistenteFalla() {
        when(productoRepository.buscarParaActualizar(99L)).thenReturn(Optional.empty());

        assertThrows(StockInsuficienteException.class,
                () -> stockService.descontar(List.of(new StockItemRequest(99L, 1))));
    }

    @Test
    void descontarProductoInactivoFalla() {
        when(productoRepository.buscarParaActualizar(4L)).thenReturn(Optional.of(producto(4L, 10, false)));

        assertThrows(StockInsuficienteException.class,
                () -> stockService.descontar(List.of(new StockItemRequest(4L, 1))));
    }

    @Test
    void reponerSumaElStock() {
        Producto producto = producto(1L, 2, true);
        when(productoRepository.buscarParaActualizar(1L)).thenReturn(Optional.of(producto));

        stockService.reponer(List.of(new StockItemRequest(1L, 4)));

        assertEquals(6, producto.getStock());
    }

    @Test
    void reponerProductoInexistenteFalla() {
        when(productoRepository.buscarParaActualizar(50L)).thenReturn(Optional.empty());

        assertThrows(StockInsuficienteException.class,
                () -> stockService.reponer(List.of(new StockItemRequest(50L, 1))));
    }

    @Test
    void listaVaciaEsRechazada() {
        assertThrows(IllegalArgumentException.class, () -> stockService.descontar(List.of()));
        assertThrows(IllegalArgumentException.class, () -> stockService.reponer(null));
    }

    @Test
    void cantidadInvalidaEsRechazada() {
        assertThrows(IllegalArgumentException.class,
                () -> stockService.descontar(List.of(new StockItemRequest(1L, 0))));
        assertThrows(IllegalArgumentException.class,
                () -> stockService.descontar(List.of(new StockItemRequest(null, 1))));
    }
}
