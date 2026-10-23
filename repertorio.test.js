const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { crearApp } = require('./index');

test('CRUD HTTP, persistencia y validaciones', async () => {
  const directorio = fs.mkdtempSync(path.join(os.tmpdir(), 'repertorio-'));
  const archivo = path.join(directorio, 'repertorio.json');
  const servidor = crearApp(archivo).listen(0);
  await new Promise((resolve) => servidor.once('listening', resolve));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  async function peticion(ruta, method = 'GET', body) {
    return fetch(base + ruta, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  }
  try {
    const pagina = await peticion('/');
    assert.equal(pagina.status, 200);
    assert.match(await pagina.text(), /Mi repertorio/);
    assert.deepEqual(await (await peticion('/canciones')).json(), []);
    const datos = { id: 123, titulo: 'Gracias a la vida', artista: 'Violeta Parra', tono: 'La menor' };
    assert.equal((await peticion('/canciones', 'POST', datos)).status, 201);
    assert.equal((await peticion('/canciones', 'POST', datos)).status, 409);
    assert.equal((await peticion('/canciones', 'POST', { titulo: 'Faltan datos' })).status, 400);
    assert.equal((await peticion('/canciones/123', 'PUT', { ...datos, tono: 'Do mayor' })).status, 200);
    assert.equal(JSON.parse(fs.readFileSync(archivo, 'utf8'))[0].tono, 'Do mayor');
    assert.equal((await peticion('/canciones/inexistente', 'PUT', datos)).status, 404);
    assert.equal((await peticion('/canciones/123', 'DELETE')).status, 200);
    assert.equal((await peticion('/canciones/123', 'DELETE')).status, 404);
    const nueva = await (await peticion('/canciones', 'POST', { titulo: 'Otra canción', artista: 'Artista', tono: 'Sol' })).json();
    assert.ok(nueva.id);
    assert.equal((await peticion(`/canciones?id=${encodeURIComponent(nueva.id)}`, 'DELETE')).status, 200);
    assert.equal((await peticion('/canciones', 'DELETE')).status, 400);
    assert.deepEqual(JSON.parse(fs.readFileSync(archivo, 'utf8')), []);
    const invalida = await fetch(base + '/canciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{incorrecto' });
    assert.equal(invalida.status, 400);
  } finally {
    await new Promise((resolve, reject) => servidor.close((error) => error ? reject(error) : resolve()));
    fs.rmSync(directorio, { recursive: true, force: true });
  }
});
