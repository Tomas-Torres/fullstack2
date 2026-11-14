package cl.levelup.login.config;

import cl.levelup.comun.ApiError;
import cl.levelup.login.dto.CampoError;
import cl.levelup.login.exception.AccesoDenegadoException;
import cl.levelup.login.exception.CorreoDuplicadoException;
import cl.levelup.login.exception.LoginException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Traduce los errores propios de ms-login. El login conserva la forma
 * {campo, mensaje} que espera el frontend; el resto usa el ApiError comun.
 */
@RestControllerAdvice
public class LoginExceptionHandler {

    @ExceptionHandler(LoginException.class)
    public ResponseEntity<CampoError> login(LoginException ex) {
        return ResponseEntity.status(ex.getEstado())
                .body(new CampoError(ex.getCampo(), ex.getMessage()));
    }

    @ExceptionHandler(CorreoDuplicadoException.class)
    public ResponseEntity<ApiError> correoDuplicado(CorreoDuplicadoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.de(409, "Conflict", ex.getMessage()));
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ApiError> accesoDenegado(AccesoDenegadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.de(403, "Forbidden", ex.getMessage()));
    }
}
