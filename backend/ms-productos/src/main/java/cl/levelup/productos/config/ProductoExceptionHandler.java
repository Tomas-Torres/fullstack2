package cl.levelup.productos.config;

import cl.levelup.comun.ApiError;
import cl.levelup.productos.exception.CategoriaConProductosException;
import cl.levelup.productos.exception.CategoriaDuplicadaException;
import cl.levelup.productos.exception.StockInsuficienteException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ProductoExceptionHandler {

    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<ApiError> stockInsuficiente(StockInsuficienteException ex) {
        Map<String, String> detalles = new LinkedHashMap<>();
        detalles.put("productoId", String.valueOf(ex.getProductoId()));
        detalles.put("disponible", String.valueOf(ex.getDisponible()));
        detalles.put("solicitado", String.valueOf(ex.getSolicitado()));
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de(409, "Conflict", ex.getMessage(), detalles));
    }

    @ExceptionHandler(CategoriaConProductosException.class)
    public ResponseEntity<ApiError> categoriaConProductos(CategoriaConProductosException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de(409, "Conflict", ex.getMessage()));
    }

    @ExceptionHandler(CategoriaDuplicadaException.class)
    public ResponseEntity<ApiError> categoriaDuplicada(CategoriaDuplicadaException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de(409, "Conflict", ex.getMessage()));
    }
}
