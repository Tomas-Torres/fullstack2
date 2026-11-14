package cl.levelup.login.controller;

import cl.levelup.comun.UsuarioAutenticado;
import cl.levelup.login.dto.RegistroRequest;
import cl.levelup.login.dto.UsuarioCreateRequest;
import cl.levelup.login.dto.UsuarioExisteResponse;
import cl.levelup.login.dto.UsuarioResponse;
import cl.levelup.login.dto.UsuarioUpdateRequest;
import cl.levelup.login.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuarios", description = "Registro publico y administracion de cuentas")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    @Operation(summary = "Registro publico", description = "Crea una cuenta con rol CLIENTE.")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        UsuarioResponse creado = usuarioService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(ServletUriComponentsBuilder.fromCurrentRequest()
                        .path("/{id}")
                        .buildAndExpand(creado.id())
                        .toUri())
                .body(creado);
    }

    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Solo ADMIN. Se puede filtrar por rol.")
    public List<UsuarioResponse> listar(@RequestParam(required = false) String rol) {
        return usuarioService.listar(rol);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario", description = "ADMIN o el mismo usuario autenticado.")
    public UsuarioResponse obtener(@PathVariable Long id,
                                   @AuthenticationPrincipal UsuarioAutenticado solicitante) {
        return usuarioService.obtener(id, solicitante);
    }

    @PostMapping
    @Operation(summary = "Crear usuario", description = "Solo ADMIN. Permite indicar rol y estado inicial.")
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioCreateRequest request) {
        UsuarioResponse creado = usuarioService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .location(ServletUriComponentsBuilder.fromCurrentRequest()
                        .path("/{id}")
                        .buildAndExpand(creado.id())
                        .toUri())
                .body(creado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario",
            description = "ADMIN o el mismo usuario. Solo ADMIN puede cambiar el rol o el estado.")
    public UsuarioResponse actualizar(@PathVariable Long id,
                                      @Valid @RequestBody UsuarioUpdateRequest request,
                                      @AuthenticationPrincipal UsuarioAutenticado solicitante) {
        return usuarioService.actualizar(id, request, solicitante);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Dar de baja", description = "Solo ADMIN. Baja logica: la cuenta queda inactiva.")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/existe")
    @Operation(summary = "Verificar existencia", description = "Publico. 200 si existe y esta activo; 404 si no.")
    public UsuarioExisteResponse existe(@PathVariable Long id) {
        return usuarioService.existe(id);
    }
}
