#!/usr/bin/env node
// copy_projects_to_projects_section_node.cjs
// Copia documentos de `projects` a `projects-section` y normaliza campos a formato localizado { es, en }
// Uso:
//   node copy_projects_to_projects_section_node.cjs --dry-run
//   node copy_projects_to_projects_section_node.cjs --confirm

// Load .env automatically if present
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
} catch (e) {
  // noop if dotenv is not installed; we'll surface error later if MONGODB_URI missing
}

const { MongoClient, ObjectId } = require('mongodb');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2), {
  boolean: ['dry-run', 'confirm'],
  alias: { d: 'dry-run', c: 'confirm' },
  default: { 'dry-run': false, confirm: false },
});

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB || process.env.MONGO_URL;

if (!MONGODB_URI) {
  console.error('Error: la variable de entorno MONGODB_URI no está definida.');
  console.error('Asegúrate de tener un archivo `.env` en `app/back-end` con MONGODB_URI o exporta la variable antes de ejecutar.');
  console.error('Ejemplo (PowerShell): $env:MONGODB_URI = "<tu-connection-string>"; node script.js');
  process.exit(2);
}

const DRY_RUN = !!argv['dry-run'];
const CONFIRM = !!argv['confirm'];

async function normalizeLocalized(value) {
  if (value == null) return null;
  if (typeof value === 'object') {
    // assume already localized or partial
    return {
      es: value.es != null ? value.es : (value.en != null ? value.en : ''),
      en: value.en != null ? value.en : (value.es != null ? value.es : ''),
    };
  }
  // string -> duplicate to both
  return { es: value, en: value };
}

async function run() {
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const db = client.db();

  const fromColl = db.collection('projects');
  const toCollName = 'projects-section';
  const toColl = db.collection(toCollName);

  console.log('Leyendo documentos de `projects`...');
  const cursor = fromColl.find({});
  const ops = [];
  let count = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    count++;

    const transformed = Object.assign({}, doc);
    // normalize localized fields
    transformed.title = await normalizeLocalized(doc.title);
    transformed.description = await normalizeLocalized(doc.description);
    transformed.project_content = await normalizeLocalized(doc.project_content);

    // Keep original _id? We'll create a new ObjectId for the new collection but keep reference
    const newDoc = Object.assign({}, transformed, {
      original_id: doc._id,
      _id: new ObjectId(),
      created_at: doc.created_at || new Date(),
      updated_at: doc.updated_at || new Date(),
    });

    ops.push(newDoc);
  }

  console.log(`Documentos leídos: ${count}`);

  if (DRY_RUN) {
    console.log('--- DRY RUN ---');
    console.log(`Se crearían ${ops.length} documentos en la colección \'${toCollName}\' (sin aplicar cambios).`);
    if (ops.length > 0) {
      console.log('Ejemplo del primer documento transformado:');
      console.log(JSON.stringify(ops[0], null, 2));
    }
    await client.close();
    process.exit(0);
  }

  if (!CONFIRM) {
    console.log('No se aplicará ningún cambio. Ejecuta con --confirm para aplicar.');
    await client.close();
    process.exit(0);
  }

  if (ops.length === 0) {
    console.log('No hay documentos para migrar. Saliendo.');
    await client.close();
    process.exit(0);
  }

  console.log(`Insertando ${ops.length} documentos en \'${toCollName}\'...`);
  try {
    const res = await toColl.insertMany(ops, { ordered: false });
    console.log(`Insertados: ${res.insertedCount}`);
  } catch (err) {
    console.error('Error al insertar documentos:', err);
  }

  await client.close();
  console.log('Migración completada.');
}

run().catch((err) => {
  console.error('Error en el script:', err);
  process.exit(1);
});
