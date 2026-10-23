const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function crearApp(archivo = path.join(__dirname, 'repertorio.json')) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  function leer() {
    if (!fs.existsSync(archivo)) fs.writeFileSync(archivo, '[]', 'utf8');
    const canciones = JSON.parse(fs.readFileSync(archivo, 'utf8'));
    if (!Array.isArray(canciones)) throw new Error('El repertorio debe ser un arreglo.');
    return canciones;
  }
  function guardar(canciones) {
    fs.writeFileSync(archivo, JSON.stringify(canciones, null, 2), 'utf8');
  }
  function datosValidos(datos) {
    return datos && ['titulo', 'artista', 'tono'].every(
      (campo) => typeof datos[campo] === 'string' && datos[campo].trim()
    );
  }
  function campos(datos) {
    return { titulo: datos.titulo.trim(), artista: datos.artista.trim(), tono: datos.tono.trim() };
  }

  app.get('/canciones', (req, res) => res.json(leer()));

  app.post('/canciones', (req, res) => {
    if (!datosValidos(req.body)) return res.status(400).json({ error: 'Completa título, artista y tono.' });
    const canciones = leer();
    const id = req.body.id == null ? randomUUID() : String(req.body.id).trim();
    if (!id) return res.status(400).json({ error: 'El ID no puede estar vacío.' });
    if (canciones.some((c) => String(c.id) === id)) return res.status(409).json({ error: 'El ID ya existe.' });
    const cancion = { id, ...campos(req.body) };
    canciones.push(cancion);
    guardar(canciones);
    res.status(201).json(cancion);
  });

  app.put('/canciones/:id', (req, res) => {
    if (!datosValidos(req.body)) return res.status(400).json({ error: 'Completa título, artista y tono.' });
    const canciones = leer();
    const indice = canciones.findIndex((c) => String(c.id) === req.params.id);
    if (indice === -1) return res.status(404).json({ error: 'Canción no encontrada.' });
    canciones[indice] = { id: canciones[indice].id, ...campos(req.body) };
    guardar(canciones);
    res.json(canciones[indice]);
  });

  // Acepta /canciones/:id y /canciones?id=... para cubrir ambas indicaciones del PDF.
  app.delete(['/canciones/:id', '/canciones'], (req, res) => {
    const id = req.params.id || req.query.id;
    if (typeof id !== 'string' || !id.trim()) return res.status(400).json({ error: 'Indica el ID de la canción.' });
    const canciones = leer();
    const indice = canciones.findIndex((c) => String(c.id) === id);
    if (indice === -1) return res.status(404).json({ error: 'Canción no encontrada.' });
    const [eliminada] = canciones.splice(indice, 1);
    guardar(canciones);
    res.json({ mensaje: 'Canción eliminada.', cancion: eliminada });
  });

  app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'El JSON enviado no es válido.' });
    console.error(error.message);
    res.status(500).json({ error: 'No se pudo procesar el repertorio.' });
  });
  return app;
}

if (require.main === module) {
  const puerto = process.env.PORT || 3000;
  crearApp().listen(puerto, () => console.log(`Mi repertorio disponible en http://localhost:${puerto}`));
}
module.exports = { crearApp };
