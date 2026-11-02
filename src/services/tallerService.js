const crypto = require('node:crypto');

function validarVIN(vin) {
  return typeof vin === 'string' && vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin);
}

function calcularPrecioFotografia(precioBase, descuento) {
  if (precioBase < 0 || descuento < 0 || descuento > 1) return 0;
  return precioBase * (1 - descuento);
}

function formatearNombreVehiculo(marca, modelo) {
  return `${marca.trim().toUpperCase()} - ${modelo.trim().toUpperCase()}`;
}

function validarStockDisponible(cantidad) {
  return typeof cantidad === 'number' && cantidad > 0;
}

function generarCodigoSeguimiento(idVehiculo) {
  const randomHex = crypto.randomInt(1000, 9999).toString();
  return `LMX-${idVehiculo}-${randomHex}`;
}

module.exports = {
  validarVIN,
  calcularPrecioFotografia,
  formatearNombreVehiculo,
  validarStockDisponible,
  generarCodigoSeguimiento
};