package cl.levelup.carrito.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Carrito de un usuario. Solo existe uno por usuario y sobrevive aunque quede
 * vacio, para conservar la fecha de la ultima operacion.
 */
@Entity
@Table(name = "carritos",
        uniqueConstraints = @UniqueConstraint(name = "uk_carritos_usuario", columnNames = "usuario_id"))
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false, unique = true)
    private Long usuarioId;

    @Column(name = "cupon_codigo", length = 20)
    private String cuponCodigo;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @OneToMany(mappedBy = "carrito", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<ItemCarrito> items = new ArrayList<>();

    public Carrito() {
    }

    public Carrito(Long usuarioId) {
        this.usuarioId = usuarioId;
        this.fechaActualizacion = LocalDateTime.now();
    }

    public void agregar(ItemCarrito item) {
        item.setCarrito(this);
        items.add(item);
    }

    public void quitar(ItemCarrito item) {
        items.remove(item);
        item.setCarrito(null);
    }

    public void quitarProducto(Long productoId) {
        items.removeIf(item -> item.getProductoId().equals(productoId));
    }

    public void vaciar() {
        items.clear();
        cuponCodigo = null;
    }

    public ItemCarrito buscarItem(Long productoId) {
        return items.stream()
                .filter(item -> item.getProductoId().equals(productoId))
                .findFirst()
                .orElse(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getCuponCodigo() {
        return cuponCodigo;
    }

    public void setCuponCodigo(String cuponCodigo) {
        this.cuponCodigo = cuponCodigo;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public List<ItemCarrito> getItems() {
        return items;
    }

    public void setItems(List<ItemCarrito> items) {
        this.items = items;
    }
}
