# Desafío: Mi repertorio

Aplicación CRUD desarrollada con Node.js, Express y el módulo File System. Las canciones se guardan en `repertorio.json`, inicialmente vacío. Incluye una interfaz propia porque el archivo de apoyo no venía adjunto al PDF.

## Ejecutar desde Visual Studio Code

1. Abre esta carpeta en Visual Studio Code.
2. Abre **Terminal → Nueva terminal**.
3. Instala las dependencias y ejecuta el servidor:

```bash
npm install
npm start
```

4. Abre http://localhost:3000 en el navegador.
5. Para detener el servidor, presiona Ctrl+C en la terminal.

Requisito: Node.js 18 o superior y npm. No requiere base de datos ni variables de entorno. El puerto predeterminado es 3000; puede cambiarse con `PORT`.

## Rutas

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/` | Entrega la página web |
| GET | `/canciones` | Lista las canciones en JSON |
| POST | `/canciones` | Agrega una canción |
| PUT | `/canciones/:id` | Actualiza una canción |
| DELETE | `/canciones/:id` | Elimina una canción por parámetro de ruta |
| DELETE | `/canciones?id=123` | Alternativa por query string indicada en el PDF |

POST y PUT reciben JSON con `titulo`, `artista` y `tono`:

```json
{ "titulo": "Gracias a la vida", "artista": "Violeta Parra", "tono": "La menor" }
```

POST también acepta un `id`; si se omite, se genera automáticamente. PUT conserva el ID original. Las respuestas usan estados 200/201, 400 para datos inválidos, 404 para una canción inexistente y 409 para IDs repetidos.

## Verificación

```bash
npm test
```

Las pruebas usan un archivo temporal, sin modificar el repertorio de entrega.

## Subir a GitHub

Crea en tu cuenta OrlandoArayaC un repositorio vacío llamado `mi-repertorio`, sin README, licencia ni .gitignore iniciales. Desde esta carpeta ejecuta:

```bash
git init
git add .
git commit -m "Desafío Mi repertorio completo"
git branch -M main
git remote add origin https://github.com/OrlandoArayaC/mi-repertorio.git
git push -u origin main
```

El `.gitignore` evita subir `node_modules`. Para la entrega en LMS utiliza el ZIP del proyecto sin esa carpeta. El PDF indica que el desarrollo es grupal; agrega los integrantes que correspondan antes de entregar si lo exige tu curso.
