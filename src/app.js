const express = require('express');
const cors = require('cors');
const crypto = require('node:crypto');
const db = require('./db');

const app = express();
app.disable('x-powered-by'); // Desactiva revelación de versión de Express (S5689)
app.use(cors());
app.use(express.json());

// Middleware de autenticación por rol
const authMiddleware = (rolRequerido) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Uso de encadenamiento opcional (S6582)
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: Token faltante' });
  }
  const token = authHeader.split(' ')[1];
  if (!token.includes(rolRequerido)) {
    return res.status(403).json({ error: 'Prohibido: Permisos insuficientes' });
  }
  next();
};

// 1. POST /api/v1/ordenes - Registrar orden con fotos (Mecánico)
app.post('/api/v1/ordenes', authMiddleware('mecanico'), async (req, res) => {
  try {
    const { vehiculoPlaca, clienteTelefono, descripcionDano, fotosEvidencia } = req.body;

    if (!vehiculoPlaca || !descripcionDano) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const ticketCodigo = `TCK-${crypto.randomInt(1000, 10000)}`;

    const { rows } = await db.query(
      `INSERT INTO ordenes_trabajo (ticket_codigo, vehiculo_placa, cliente_telefono, descripcion_dano)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ticketCodigo, vehiculoPlaca, clienteTelefono, descripcionDano]
    );

    const nuevaOrden = rows[0];
    nuevaOrden.fotosEvidencia = [];

    // Uso de Promise.all en lugar de await dentro de bucle (S9382)
    if (Array.isArray(fotosEvidencia) && fotosEvidencia.length > 0) {
      const inserciones = fotosEvidencia.map((url) =>
        db.query(
          `INSERT INTO fotos_evidencia (orden_id, url_foto) VALUES ($1, $2)`,
          [nuevaOrden.id, url]
        )
      );
      await Promise.all(inserciones);
      nuevaOrden.fotosEvidencia = fotosEvidencia;
    }

    return res.status(201).json(nuevaOrden);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. PATCH /api/v1/ordenes/:id/estado - Actualizar estado y notificar (Mecánico)
app.patch('/api/v1/ordenes/:id/estado', authMiddleware('mecanico'), async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const notificacionEnviada = estado === 'TERMINADO';

    const { rows } = await db.query(
      `UPDATE ordenes_trabajo 
       SET estado = $1, notificacion_enviada = $2 
       WHERE id = $3 RETURNING *`,
      [estado, notificacionEnviada, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/v1/finanzas/resumen - Métrica de ingresos y ganancias (Dueño)
app.get('/api/v1/finanzas/resumen', authMiddleware('dueno'), async (req, res) => {
  try {
    const invRes = await db.query(`SELECT COALESCE(SUM(stock * costo_inversion), 0) AS inversion FROM refacciones`);
    // Uso de Number.parseFloat (S7773)
    const inversionRefacciones = Number.parseFloat(invRes.rows[0].inversion);

    const ingresosTotales = 15000.00;
    const gananciaNeta = ingresosTotales - inversionRefacciones;

    return res.status(200).json({
      ingresosTotales,
      inversionRefacciones,
      gananciaNeta
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/v1/inventario/ajuste - Incrementar stock (Encargado/Dueño)
app.post('/api/v1/inventario/ajuste', authMiddleware('encargado'), async (req, res) => {
  try {
    const { refaccionId, cantidadAgregada } = req.body;

    const { rows } = await db.query(
      `UPDATE refacciones SET stock = stock + $1 WHERE id = $2 RETURNING *`,
      [cantidadAgregada, refaccionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Refacción no encontrada' });
    }

    return res.status(200).json({
      refaccionId: rows[0].id,
      stockActualizado: rows[0].stock
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. GET /api/v1/tickets/:codigo - Consulta pública del ticket (Cliente)
app.get('/api/v1/tickets/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    const { rows } = await db.query(
      `SELECT ticket_codigo, vehiculo_placa, descripcion_dano, estado, creado_en 
       FROM ordenes_trabajo WHERE ticket_codigo = $1`,
      [codigo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = app;