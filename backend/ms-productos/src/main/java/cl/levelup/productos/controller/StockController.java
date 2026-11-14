package cl.levelup.productos.controller;

import cl.levelup.productos.dto.StockItemRequest;
import cl.levelup.productos.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Endpoints internos que consume ms-compras para reservar y liberar stock.
 */
@RestController
@RequestMapping("/api/productos/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping("/descontar")
    public ResponseEntity<Map<String, String>> descontar(@RequestBody List<StockItemRequest> items) {
        stockService.descontar(items);
        return ResponseEntity.ok(Map.of("mensaje", "Stock descontado correctamente"));
    }

    @PostMapping("/reponer")
    public ResponseEntity<Map<String, String>> reponer(@RequestBody List<StockItemRequest> items) {
        stockService.reponer(items);
        return ResponseEntity.ok(Map.of("mensaje", "Stock repuesto correctamente"));
    }
}
