const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

jest.mock('../src/db', () => ({
  query: jest.fn()
}));

describe('Pruebas de Integración y Calidad - Lumix Auto Studio API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('CP-REST-001: Registro de Orden de Trabajo con Evidencia Fotográfica (AAA)', async () => {
    // ARRANGE
    const tokenMecanico = 'Bearer token_mecanico_123';
    const ordenPayload = {
      vehiculoPlaca: 'JAL-4589',
      clienteTelefono: '+523311223344',
      descripcionDano: 'Ajuste de suspensión y reprogramación de audio',
      fotosEvidencia: ['https://s3.amazonaws.com/lumix/foto1.jpg']
    };

    db.query
      .mockResolvedValueOnce({
        rows: [{
          id: '123e4567-e89b-12d3-a456-426614174000',
          ticket_codigo: 'TCK-8821',
          vehiculo_placa: 'JAL-4589',
          descripcion_dano: ordenPayload.descripcionDano,
          estado: 'EN_PROCESO'
        }]
      })
      .mockResolvedValueOnce({ rows: [] });

    // ACT
    const response = await request(app)
      .post('/api/v1/ordenes')
      .set('Authorization', tokenMecanico)
      .send(ordenPayload);

    // ASSERT
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('ticket_codigo', 'TCK-8821');
    expect(response.body.fotosEvidencia).toHaveLength(1);
  });

  test('CP-REST-002: Actualización a TERMINADO y Disparo de Notificación (AAA)', async () => {
    // ARRANGE
    const ordenId = '123e4567-e89b-12d3-a456-426614174000';
    const tokenMecanico = 'Bearer token_mecanico_123';

    db.query.mockResolvedValueOnce({
      rows: [{ id: ordenId, estado: 'TERMINADO', notificacion_enviada: true }]
    });

    // ACT
    const response = await request(app)
      .patch(`/api/v1/ordenes/${ordenId}/estado`)
      .set('Authorization', tokenMecanico)
      .send({ estado: 'TERMINADO' });

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.estado).toBe('TERMINADO');
    expect(response.body.notificacion_enviada).toBe(true);
  });

  test('CP-REST-003: Consulta de Resumen Financiero por el Dueño (AAA)', async () => {
    // ARRANGE
    const tokenDueno = 'Bearer token_dueno_123';
    db.query.mockResolvedValueOnce({ rows: [{ inversion: '4500.00' }] });

    // ACT
    const response = await request(app)
      .get('/api/v1/finanzas/resumen')
      .set('Authorization', tokenDueno);

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.ingresosTotales).toBe(15000.00);
    expect(response.body.inversionRefacciones).toBe(4500.00);
    expect(response.body.gananciaNeta).toBe(10500.00);
  });

  test('CP-REST-004: Incremento de Stock de Refacciones (AAA)', async () => {
    // ARRANGE
    const tokenEncargado = 'Bearer token_encargado_123';
    const refaccionId = '11111111-1111-1111-1111-111111111111';

    db.query.mockResolvedValueOnce({
      rows: [{ id: refaccionId, stock: 20 }]
    });

    // ACT
    const response = await request(app)
      .post('/api/v1/inventario/ajuste')
      .set('Authorization', tokenEncargado)
      .send({ refaccionId, cantidadAgregada: 10 });

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.stockActualizado).toBe(20);
  });

  test('CP-REST-005: Consulta Pública de Ticket sin Información Sensible (AAA)', async () => {
    // ARRANGE
    const codigoTicket = 'TCK-8821';
    db.query.mockResolvedValueOnce({
      rows: [{
        ticket_codigo: 'TCK-8821',
        vehiculo_placa: 'JAL-4589',
        descripcion_dano: 'Reparación de pintura',
        estado: 'EN_PROCESO'
      }]
    });

    // ACT
    const response = await request(app).get(`/api/v1/tickets/${codigoTicket}`);

    // ASSERT
    expect(response.status).toBe(200);
    expect(response.body.ticket_codigo).toBe('TCK-8821');
    expect(response.body).not.toHaveProperty('costo_refacciones');
  });

});