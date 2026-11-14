package cl.levelup.productos.service;

import cl.levelup.productos.dto.StockItemRequest;
import cl.levelup.productos.exception.StockInsuficienteException;
import cl.levelup.productos.model.Producto;
import cl.levelup.productos.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Verifica el rollback real de la transaccion de stock contra H2.
 */
@SpringBootTest
class StockServiceIntegrationTest {

    @Autowired
    private StockService stockService;

    @Autowired
    private ProductoRepository productoRepository;

    private Producto buscar(String nombre) {
        return productoRepository.findAll().stream()
                .filter(producto -> producto.getNombre().equals(nombre))
                .findFirst()
                .orElseThrow();
    }

    @Test
    void descontarConStockInsuficienteNoCambiaNada() {
        Producto catan = buscar("Catan");
        Producto gta6 = buscar("GTA6 (Versión Digital)");
        int stockInicial = catan.getStock();

        assertThrows(StockInsuficienteException.class, () -> stockService.descontar(List.of(
                new StockItemRequest(catan.getId(), 2),
                new StockItemRequest(gta6.getId(), 1))));

        assertEquals(stockInicial, buscar("Catan").getStock());
    }

    @Test
    void descontarYReponerRestauraElStock() {
        Producto catan = buscar("Catan");
        int stockInicial = catan.getStock();

        stockService.descontar(List.of(new StockItemRequest(catan.getId(), 2)));
        assertEquals(stockInicial - 2, buscar("Catan").getStock());

        stockService.reponer(List.of(new StockItemRequest(catan.getId(), 2)));
        assertEquals(stockInicial, buscar("Catan").getStock());
    }
}
