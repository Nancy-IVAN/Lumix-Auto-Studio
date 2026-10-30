const express = require('express');
const cors = require('cors');
const crypto = require('node:crypto');
const db = require('./db');

const app = express();
app.disable('x-powered-by');

// Configuración segura de CORS con restricciones explícitas
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json());

// Resto de tus endpoints...

// Endpoint de órdenes con crypto.randomInt seguro
app.post('/api/v1/ordenes', authMiddleware('mecanico'), async (req, res) => {
  try {
    const { vehiculoPlaca, clienteTelefono, descripcionDano, fotosEvidencia } = req.body;

    if (!vehiculoPlaca || !descripcionDano) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // Generador aleatorio criptográficamente seguro (Elimina el problema High)
    const ticketCodigo = `TCK-${crypto.randomInt(1000, 10000)}`;

    const { rows } = await db.query(
      `INSERT INTO ordenes_trabajo (ticket_codigo, vehiculo_placa, cliente_telefono, descripcion_dano)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ticketCodigo, vehiculoPlaca, clienteTelefono, descripcionDano]
    );

    const nuevaOrden = rows[0];
    nuevaOrden.fotosEvidencia = [];

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