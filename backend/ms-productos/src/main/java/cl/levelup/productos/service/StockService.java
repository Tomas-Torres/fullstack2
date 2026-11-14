package cl.levelup.productos.service;

import cl.levelup.productos.dto.StockItemRequest;
import cl.levelup.productos.exception.StockInsuficienteException;
import cl.levelup.productos.model.Producto;
import cl.levelup.productos.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

/**
 * Ajustes de stock internos. Todas las operaciones son "todo o nada" dentro
 * de una unica transaccion y bloquean las filas en orden ascendente de id.
 */
@Service
public class StockService {

    private final ProductoRepository productoRepository;

    public StockService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Transactional
    public void descontar(List<StockItemRequest> items) {
        Map<Long, Integer> cantidades = agrupar(items);
        for (Long productoId : new TreeSet<>(cantidades.keySet())) {
            Producto producto = productoRepository.buscarParaActualizar(productoId)
                    .orElseThrow(() -> new StockInsuficienteException(productoId, "el producto no existe", 0, cantidades.get(productoId)));

            int solicitado = cantidades.get(productoId);
            int disponible = producto.getStock() == null ? 0 : producto.getStock();

            if (!Boolean.TRUE.equals(producto.getActivo())) {
                throw new StockInsuficienteException(productoId, "el producto esta inactivo", disponible, solicitado);
            }
            if (disponible < solicitado) {
                throw new StockInsuficienteException(productoId, "stock insuficiente", disponible, solicitado);
            }
            producto.setStock(disponible - solicitado);
        }
    }

    @Transactional
    public void reponer(List<StockItemRequest> items) {
        Map<Long, Integer> cantidades = agrupar(items);
        for (Long productoId : new TreeSet<>(cantidades.keySet())) {
            Producto producto = productoRepository.buscarParaActualizar(productoId)
                    .orElseThrow(() -> new StockInsuficienteException(productoId, "el producto no existe", 0, cantidades.get(productoId)));
            int actual = producto.getStock() == null ? 0 : producto.getStock();
            producto.setStock(actual + cantidades.get(productoId));
        }
    }

    private Map<Long, Integer> agrupar(List<StockItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("La lista de ajustes de stock no puede estar vacia");
        }
        Map<Long, Integer> cantidades = new LinkedHashMap<>();
        for (StockItemRequest item : items) {
            if (item == null || item.productoId() == null) {
                throw new IllegalArgumentException("Cada ajuste debe indicar un productoId");
            }
            if (item.cantidad() == null || item.cantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor a 0 para el producto " + item.productoId());
            }
            cantidades.merge(item.productoId(), item.cantidad(), Integer::sum);
        }
        return cantidades;
    }
}
