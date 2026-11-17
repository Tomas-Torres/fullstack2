package cl.levelup.carrito.config;

import cl.levelup.carrito.exception.AccesoDenegadoException;
import cl.levelup.carrito.exception.CuponInvalidoException;
import cl.levelup.carrito.exception.ProductoNoEncontradoException;
import cl.levelup.carrito.exception.ServicioNoDisponibleException;
import cl.levelup.carrito.exception.StockInsuficienteException;
import cl.levelup.comun.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class CarritoExceptionHandler {

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ApiError> accesoDenegado(AccesoDenegadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.de(403, "Forbidden", ex.getMessage()));
    }

    @ExceptionHandler(ProductoNoEncontradoException.class)
    public ResponseEntity<ApiError> productoNoEncontrado(ProductoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.de(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<ApiError> stockInsuficiente(StockInsuficienteException ex) {
        Map<String, String> detalles = new LinkedHashMap<>();
        detalles.put("productoId", String.valueOf(ex.getProductoId()));
        detalles.put("disponible", String.valueOf(ex.getDisponible()));
        detalles.put("solicitado", String.valueOf(ex.getSolicitado()));
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de(409, "Conflict", ex.getMessage(), detalles));
    }

    @ExceptionHandler(CuponInvalidoException.class)
    public ResponseEntity<ApiError> cuponInvalido(CuponInvalidoException ex) {
        Map<String, String> detalles = new LinkedHashMap<>();
        detalles.put("codigo", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiError.de(400, "Bad Request", ex.getMessage(), detalles));
    }

    @ExceptionHandler(ServicioNoDisponibleException.class)
    public ResponseEntity<ApiError> servicioNoDisponible(ServicioNoDisponibleException ex) {
        Map<String, String> detalles = new LinkedHashMap<>();
        detalles.put("servicio", ex.getServicio());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiError.de(503, "Service Unavailable", ex.getMessage(), detalles));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> cuerpoIlegible(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(ApiError.de(400, "Bad Request", "El cuerpo de la solicitud no es valido"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> parametroInvalido(MethodArgumentTypeMismatchException ex) {
        Map<String, String> detalles = new LinkedHashMap<>();
        detalles.put(ex.getName(), "El valor indicado no es valido");
        return ResponseEntity.badRequest()
                .body(ApiError.de(400, "Bad Request", "Hay parametros invalidos", detalles));
    }
}
