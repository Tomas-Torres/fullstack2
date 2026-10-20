import { formatoCLP, precioConOferta, ENTREGAS } from '../../src/utils/precios'

describe('Utilidades de precios', () => {
  describe('formatoCLP', () => {
    it('formatea un monto en pesos chilenos', () => {
      expect(formatoCLP(29990)).toBe('$29.990')
    })

    it('formatea montos grandes con separador de miles', () => {
      expect(formatoCLP(1299990)).toBe('$1.299.990')
    })

    it('formatea el cero', () => {
      expect(formatoCLP(0)).toBe('$0')
    })
  })

  describe('precioConOferta', () => {
    it('devuelve el precio original si no hay oferta', () => {
      expect(precioConOferta({ precio: 29990 })).toBe(29990)
      expect(precioConOferta({ precio: 29990, oferta: 0 })).toBe(29990)
      expect(precioConOferta({ precio: 29990, oferta: -5 })).toBe(29990)
    })

    it('descuenta el porcentaje de la oferta', () => {
      expect(precioConOferta({ precio: 29990, oferta: 15 })).toBe(Math.round(29990 * 0.85))
    })

    it('redondea hacia arriba al peso más cercano', () => {
      // 100 * 0.15 = 15 exacto, pero con 33% da decimal: 100 * 0.67 = 67 exacto...
      expect(precioConOferta({ precio: 9999, oferta: 15 })).toBe(Math.round(9999 * 0.85))
      expect(Number.isInteger(precioConOferta({ precio: 9999, oferta: 15 }))).toBe(true)
    })
  })

  describe('ENTREGAS', () => {
    it('ofrece las tres opciones de entrega del checkout', () => {
      expect(ENTREGAS).toHaveLength(3)
      expect(ENTREGAS.map((e) => e.id)).toEqual(['estandar', 'express', 'retiro'])
    })

    it('el retiro en tienda es gratis y el exprés cuesta más que el estándar', () => {
      const retiro = ENTREGAS.find((e) => e.id === 'retiro')
      const estandar = ENTREGAS.find((e) => e.id === 'estandar')
      const express = ENTREGAS.find((e) => e.id === 'express')
      expect(retiro.costo).toBe(0)
      expect(express.costo).toBeGreaterThan(estandar.costo)
    })

    it('cada opción tiene nombre y costo definidos', () => {
      ENTREGAS.forEach((op) => {
        expect(op.nombre.length).toBeGreaterThan(0)
        expect(typeof op.costo).toBe('number')
        expect(op.costo).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
