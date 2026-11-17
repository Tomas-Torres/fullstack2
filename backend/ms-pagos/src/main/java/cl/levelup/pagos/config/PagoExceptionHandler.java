package cl.levelup.pagos.config;

import cl.levelup.pagos.exception.PagoDuplicadoException;
import cl.levelup.pagos.exception.PagoInvalidoException;
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
public class PagoExceptionHandler {

    @ExceptionHandler(PagoDuplicadoException.class)
    public ResponseEntity<ApiError> pagoDuplicado(PagoDuplicadoException ex) {
        Map<String, String> detalles = new LinkedHashMap<>();
        detalles.put("ordenId", String.valueOf(ex.getOrdenId()));
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de(409, "Conflict", ex.getMessage(), detalles));
    }

    @ExceptionHandler(PagoInvalidoException.class)
    public ResponseEntity<ApiError> pagoInvalido(PagoInvalidoException ex) {
        Map<String, String> detalles = new LinkedHashMap<>();
        detalles.put(ex.getCampo(), ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiError.de(400, "Bad Request", "Hay campos invalidos", detalles));
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
