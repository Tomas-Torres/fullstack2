package cl.levelup.pagos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * Registro de un intento de cobro. Nunca guarda el numero completo de la
 * tarjeta: solo los cuatro ultimos digitos.
 */
@Entity
@Table(name = "pagos", indexes = @Index(name = "idx_pagos_orden", columnList = "orden_id"))
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "orden_id", nullable = false)
    private Long ordenId;

    @Column(nullable = false)
    private Integer monto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MetodoPago metodo;

    @Column(name = "ultimos_digitos", length = 4)
    private String ultimosDigitos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPago estado;

    @Column(name = "codigo_transaccion", nullable = false, unique = true, length = 36)
    private String codigoTransaccion;

    @Column(name = "motivo_rechazo", length = 120)
    private String motivoRechazo;

    @Column(nullable = false)
    private LocalDateTime fecha;

    public Pago() {
    }

    public boolean estaAprobado() {
        return estado == EstadoPago.APROBADO;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrdenId() {
        return ordenId;
    }

    public void setOrdenId(Long ordenId) {
        this.ordenId = ordenId;
    }

    public Integer getMonto() {
        return monto;
    }

    public void setMonto(Integer monto) {
        this.monto = monto;
    }

    public MetodoPago getMetodo() {
        return metodo;
    }

    public void setMetodo(MetodoPago metodo) {
        this.metodo = metodo;
    }

    public String getUltimosDigitos() {
        return ultimosDigitos;
    }

    public void setUltimosDigitos(String ultimosDigitos) {
        this.ultimosDigitos = ultimosDigitos;
    }

    public EstadoPago getEstado() {
        return estado;
    }

    public void setEstado(EstadoPago estado) {
        this.estado = estado;
    }

    public String getCodigoTransaccion() {
        return codigoTransaccion;
    }

    public void setCodigoTransaccion(String codigoTransaccion) {
        this.codigoTransaccion = codigoTransaccion;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
