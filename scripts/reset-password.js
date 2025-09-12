#!/usr/bin/env node
/**
 * scripts/reset-password.js
 *
 * Uso seguro para entornos locales/administrativos: resetea la contraseña de un usuario
 * identificado por email. NO se debe usar en producción directamente sin revisar.
 *
 * Requiere las variables de entorno:
 * - MONGO_URI         : URI de conexión a MongoDB (ej: mongodb://localhost:27017/miDB)
 * - TARGET_EMAIL      : email del usuario objetivo (busca case-insensitive)
 * - NEW_PASS          : nueva contraseña en texto plano (temporal, será hasheada)
 * - CONFIRM=yes       : confirma la ejecución (evita ejecuciones accidentales)
 * - USERS_COLLECTION  : (opcional) nombre de la colección, por defecto 'users'
 *
 * Ejemplo (PowerShell):
 *  $env:MONGO_URI='mongodb://localhost:27017/mydb'; $env:TARGET_EMAIL='adavilag.contact@gmail.com'; $env:NEW_PASS='NuevaPass123!'; $env:CONFIRM='yes'; node scripts/reset-password.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGO_URI;
const email = process.env.TARGET_EMAIL;
const newPass = process.env.NEW_PASS;
const confirm = (process.env.CONFIRM || '').toLowerCase();
const usersCollection = process.env.USERS_COLLECTION || 'users';

if (!uri || !email || !newPass) {
  console.error('\nMissing required environment variables.\n');
  console.error('Required: MONGO_URI, TARGET_EMAIL, NEW_PASS');
  console.error("Optional: CONFIRM='yes' (required to actually run), USERS_COLLECTION");
  process.exit(1);
}

if (confirm !== 'yes' && confirm !== '1') {
  console.error("Safety check: set CONFIRM='yes' to actually run the script. Aborting.");
  process.exit(2);
}

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection(usersCollection);

    console.log('Looking for user (case-insensitive) with email:', email);
    const user = await users.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (!user) {
      console.error('User not found. Check email or collection name.');
      process.exit(3);
    }

    const hashed = bcrypt.hashSync(newPass, 12);

    const result = await users.updateOne({ _id: user._id }, { $set: { password: hashed } });
    if (result.matchedCount === 1) {
      console.log(`Password reset for user: ${user.email} (id=${user._id}).`);
      console.log('Please invalidate sessions/tokens if applicable.');
      process.exit(0);
    } else {
      console.error('Failed to update password for user:', user._id);
      process.exit(4);
    }
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(99);
  } finally {
    try {
      await client.close();
    } catch (e) {}
  }
}

main();
