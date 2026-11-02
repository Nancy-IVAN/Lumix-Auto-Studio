const { calcularCotizacionEstudio } = require('../src/controllers/estudioController');

describe('Pruebas Unitarias - Cotización de Estudio Fotográfico (Lumix Auto Studio)', () => {

  // Caso 1: Paquete Estándar SEDAN
  test('Debe calcular correctamente el paquete estándar para un SEDAN', () => {
    // ARRANGE: Configuración de entradas y resultado esperado
    const tipoVehiculo = 'SEDAN';
    const incluirVideo360 = false;
    const horasAdicionales = 0;

    // ACT: Ejecución de la función
    const resultado = calcularCotizacionEstudio(tipoVehiculo, incluirVideo360, horasAdicionales);

    // ASSERT: Verificación del resultado
    expect(resultado.total).toBe(1500);
    expect(resultado.desglose.base).toBe(1500);
  });

  // Caso 2: SUV con Video 360°
  test('Debe calcular el costo para un SUV con módulo de video 360°', () => {
    // ARRANGE
    const tipoVehiculo = 'SUV';
    const incluirVideo360 = true;
    const horasAdicionales = 0;

    // ACT
    const resultado = calcularCotizacionEstudio(tipoVehiculo, incluirVideo360, horasAdicionales);

    // ASSERT
    expect(resultado.total).toBe(2700); // 2200 base + 500 video
  });

  // Caso 3: SUPERCAR con horas adicionales
  test('Debe aplicar costo premium a SUPERCAR más horas adicionales', () => {
    // ARRANGE
    const tipoVehiculo = 'SUPERCAR';
    const incluirVideo360 = true;
    const horasAdicionales = 2;

    // ACT
    const resultado = calcularCotizacionEstudio(tipoVehiculo, incluirVideo360, horasAdicionales);

    // ASSERT
    expect(resultado.total).toBe(4300); // 3200 base + 500 video + 600 horas extra
  });

  // Caso 4: Tipo de vehículo no soportado
  test('Debe lanzar un error cuando el tipo de vehículo no existe', () => {
    // ARRANGE
    const tipoVehiculo = 'MOTOCICLETA';

    // ACT & ASSERT
    expect(() => {
      calcularCotizacionEstudio(tipoVehiculo, false, 0);
    }).toThrow('Tipo de vehículo no válido en el sistema de Lumix');
  });

  // Caso 5: Horas adicionales negativas
  test('Debe lanzar un error si se ingresan horas adicionales negativas', () => {
    // ARRANGE
    const horasInvalidas = -1;

    // ACT & ASSERT
    expect(() => {
      calcularCotizacionEstudio('SEDAN', false, horasInvalidas);
    }).toThrow('Las horas adicionales no pueden ser valores negativos');
  });

});