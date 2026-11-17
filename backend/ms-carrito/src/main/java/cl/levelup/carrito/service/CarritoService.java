package cl.levelup.carrito.service;

import cl.levelup.carrito.client.ProductoClient;
import cl.levelup.carrito.client.ProductoInfo;
import cl.levelup.carrito.dto.CarritoResponse;
import cl.levelup.carrito.exception.AccesoDenegadoException;
import cl.levelup.carrito.exception.CuponInvalidoException;
import cl.levelup.carrito.exception.StockInsuficienteException;
import cl.levelup.carrito.model.Carrito;
import cl.levelup.carrito.model.Cupon;
import cl.levelup.carrito.model.ItemCarrito;
import cl.levelup.carrito.repository.CarritoRepository;
import cl.levelup.comun.UsuarioAutenticado;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

/**
 * Reglas del carrito: items, cantidades, cupones y totales. No procesa pagos
 * ni crea ordenes.
 */
@Service
@Transactional(readOnly = true)
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoClient productoClient;

    public CarritoService(CarritoRepository carritoRepository, ProductoClient productoClient) {
        this.carritoRepository = carritoRepository;
        this.productoClient = productoClient;
    }

    public CarritoResponse obtener(Long usuarioId, UsuarioAutenticado usuario) {
        verificarAcceso(usuarioId, usuario);
        return carritoRepository.findByUsuarioId(usuarioId)
                .map(this::mapear)
                .orElseGet(() -> CarritoResponse.vacio(usuarioId));
    }

    @Transactional
    public CarritoResponse agregar(Long usuarioId, Long productoId, int cantidad,
                                   UsuarioAutenticado usuario, String authorization) {
        verificarAcceso(usuarioId, usuario);

        ProductoInfo producto = productoClient.obtener(productoId, authorization);
        validarStock(producto, cantidad);

        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> new Carrito(usuarioId));

        ItemCarrito item = carrito.buscarItem(productoId);
        int nuevaCantidad = cantidad + (item == null ? 0 : item.getCantidad());
        validarStock(producto, nuevaCantidad);

        if (item == null) {
            item = new ItemCarrito(productoId, producto.nombre(), producto.imagen(),
                    producto.precioFinal(), nuevaCantidad);
            carrito.agregar(item);
        } else {
            item.setCantidad(nuevaCantidad);
            item.refrescar(producto.nombre(), producto.imagen(), producto.precioFinal());
        }

        return guardar(carrito);
    }

    @Transactional
    public CarritoResponse actualizarCantidad(Long usuarioId, Long productoId, int cantidad,
                                              UsuarioAutenticado usuario, String authorization) {
        verificarAcceso(usuarioId, usuario);

        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new NoSuchElementException("El carrito no existe para el usuario " + usuarioId));
        ItemCarrito item = carrito.buscarItem(productoId);
        if (item == null) {
            throw new NoSuchElementException("El producto " + productoId + " no esta en el carrito");
        }

        if (cantidad == 0) {
            carrito.quitar(item);
            return guardar(carrito);
        }

        ProductoInfo producto = productoClient.obtener(productoId, authorization);
        validarStock(producto, cantidad);

        item.setCantidad(cantidad);
        item.refrescar(producto.nombre(), producto.imagen(), producto.precioFinal());
        return guardar(carrito);
    }

    @Transactional
    public void eliminarItem(Long usuarioId, Long productoId, UsuarioAutenticado usuario) {
        verificarAcceso(usuarioId, usuario);

        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new NoSuchElementException("El carrito no existe para el usuario " + usuarioId));
        if (carrito.buscarItem(productoId) == null) {
            throw new NoSuchElementException("El producto " + productoId + " no esta en el carrito");
        }
        carrito.quitarProducto(productoId);
        carrito.setFechaActualizacion(LocalDateTime.now());
        carritoRepository.save(carrito);
    }

    @Transactional
    public void vaciar(Long usuarioId, UsuarioAutenticado usuario) {
        verificarAcceso(usuarioId, usuario);

        carritoRepository.findByUsuarioId(usuarioId).ifPresent(carrito -> {
            carrito.vaciar();
            carrito.setFechaActualizacion(LocalDateTime.now());
            carritoRepository.save(carrito);
        });
    }

    @Transactional
    public CarritoResponse aplicarCupon(Long usuarioId, String codigo, UsuarioAutenticado usuario) {
        verificarAcceso(usuarioId, usuario);

        Cupon cupon = Cupon.desde(codigo).orElseThrow(CuponInvalidoException::new);
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> new Carrito(usuarioId));
        carrito.setCuponCodigo(cupon.name());
        return guardar(carrito);
    }

    @Transactional
    public CarritoResponse quitarCupon(Long usuarioId, UsuarioAutenticado usuario) {
        verificarAcceso(usuarioId, usuario);

        return carritoRepository.findByUsuarioId(usuarioId)
                .map(carrito -> {
                    carrito.setCuponCodigo(null);
                    return guardar(carrito);
                })
                .orElseGet(() -> CarritoResponse.vacio(usuarioId));
    }

    private CarritoResponse guardar(Carrito carrito) {
        carrito.setFechaActualizacion(LocalDateTime.now());
        return mapear(carritoRepository.save(carrito));
    }

    private CarritoResponse mapear(Carrito carrito) {
        Cupon cupon = carrito.getCuponCodigo() == null
                ? null
                : Cupon.desde(carrito.getCuponCodigo()).orElse(null);
        return CarritoResponse.from(carrito, cupon);
    }

    private void verificarAcceso(Long usuarioId, UsuarioAutenticado usuario) {
        if (usuario == null) {
            throw new AccesoDenegadoException();
        }
        if (!usuario.esAdmin() && !usuario.esMismo(usuarioId)) {
            throw new AccesoDenegadoException();
        }
    }

    private void validarStock(ProductoInfo producto, int cantidad) {
        int disponible = producto.stock() == null ? 0 : producto.stock();
        if (Boolean.TRUE.equals(producto.sinStock()) || disponible < cantidad) {
            throw new StockInsuficienteException(producto.id(), disponible, cantidad);
        }
    }
}
