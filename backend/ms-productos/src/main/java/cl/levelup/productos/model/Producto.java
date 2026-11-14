package cl.levelup.productos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Producto del catalogo. Los precios se manejan en pesos chilenos (CLP).
 */
@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, length = 120)
    private String atributo;

    @Column(nullable = false)
    private Integer precio;

    @Column(nullable = false)
    private Integer descuento = 0;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false, length = 255)
    private String imagen;

    @Column(nullable = false)
    private Boolean activo = true;

    public Producto() {
    }

    /**
     * Precio final en CLP aplicando el descuento porcentual y redondeando.
     */
    public int calcularPrecioFinal() {
        int descuentoActual = descuento == null ? 0 : descuento;
        int precioActual = precio == null ? 0 : precio;
        return (int) Math.round(precioActual * (1 - descuentoActual / 100.0));
    }

    public boolean estaEnOferta() {
        return descuento != null && descuento > 0;
    }

    public boolean estaSinStock() {
        return stock == null || stock <= 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public String getAtributo() {
        return atributo;
    }

    public void setAtributo(String atributo) {
        this.atributo = atributo;
    }

    public Integer getPrecio() {
        return precio;
    }

    public void setPrecio(Integer precio) {
        this.precio = precio;
    }

    public Integer getDescuento() {
        return descuento;
    }

    public void setDescuento(Integer descuento) {
        this.descuento = descuento;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
