const formulario = document.querySelector('#formulario');
const lista = document.querySelector('#lista');
const estado = document.querySelector('#estado');
let editando = null;

function mensaje(texto, error = false) {
  estado.textContent = texto;
  estado.classList.toggle('error', error);
}
async function solicitar(url, opciones) {
  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || 'No se pudo completar la operación.');
  return datos;
}
function cancelar() {
  editando = null;
  formulario.reset();
  document.querySelector('#formTitulo').textContent = 'Agregar canción';
  document.querySelector('#guardar').textContent = 'Agregar canción';
  document.querySelector('#cancelar').hidden = true;
}
async function cargar() {
  const canciones = await solicitar('/canciones');
  lista.replaceChildren();
  document.querySelector('#vacio').hidden = canciones.length > 0;
  canciones.forEach((cancion, indice) => {
    const fila = document.createElement('tr');
    [indice + 1, cancion.titulo, cancion.artista, cancion.tono].forEach((valor) => {
      const celda = document.createElement('td');
      celda.textContent = valor;
      fila.append(celda);
    });
    const acciones = document.createElement('td');
    const editar = document.createElement('button');
    editar.textContent = 'Editar';
    editar.className = 'secondary';
    editar.onclick = () => {
      editando = cancion.id;
      ['titulo', 'artista', 'tono'].forEach((campo) => document.getElementById(campo).value = cancion[campo]);
      document.querySelector('#formTitulo').textContent = 'Editar canción';
      document.querySelector('#guardar').textContent = 'Guardar cambios';
      document.querySelector('#cancelar').hidden = false;
      document.querySelector('#titulo').focus();
      mensaje('Modifica los datos y guarda los cambios.');
    };
    const eliminar = document.createElement('button');
    eliminar.textContent = 'Eliminar';
    eliminar.className = 'danger';
    eliminar.onclick = async () => {
      if (!confirm(`¿Eliminar "${cancion.titulo}"?`)) return;
      try {
        await solicitar(`/canciones/${encodeURIComponent(cancion.id)}`, { method: 'DELETE' });
        if (editando === cancion.id) cancelar();
        await cargar();
        mensaje('Canción eliminada.');
      } catch (error) { mensaje(error.message, true); }
    };
    acciones.append(editar, eliminar);
    fila.append(acciones);
    lista.append(fila);
  });
}
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const boton = document.querySelector('#guardar');
  boton.disabled = true;
  const datos = Object.fromEntries(['titulo', 'artista', 'tono'].map((campo) => [campo, document.getElementById(campo).value.trim()]));
  try {
    await solicitar(editando === null ? '/canciones' : `/canciones/${encodeURIComponent(editando)}`, {
      method: editando === null ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    cancelar();
    await cargar();
    mensaje('Canción guardada correctamente.');
  } catch (error) { mensaje(error.message, true); }
  finally { boton.disabled = false; }
});
document.querySelector('#cancelar').onclick = () => { cancelar(); mensaje('Edición cancelada.'); };
cargar().catch((error) => mensaje(error.message, true));
