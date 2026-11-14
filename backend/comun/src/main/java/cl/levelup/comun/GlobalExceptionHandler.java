package cl.levelup.comun;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Traduce excepciones comunes a respuestas HTTP coherentes.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiError> noEncontrado(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.de(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> solicitudInvalida(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(ApiError.de(400, "Bad Request", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validacion(MethodArgumentNotValidException ex) {
        Map<String, String> detalles = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            detalles.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest()
                .body(ApiError.de(400, "Bad Request", "Hay campos invalidos", detalles));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> restricciones(ConstraintViolationException ex) {
        return ResponseEntity.badRequest()
                .body(ApiError.de(400, "Bad Request", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> conflicto(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de(409, "Conflict", "El recurso entra en conflicto con datos existentes"));
    }
}
