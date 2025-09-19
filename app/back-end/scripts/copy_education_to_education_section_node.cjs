#!/usr/bin/env node
/* Copy Education collection to education-section with localization for institution, title and description */
const { MongoClient } = require('mongodb');
const argv = require('minimist')(process.argv.slice(2));

async function main() {
  const uri = argv.uri || process.env.MONGO_URI;
  const dbName = argv.db || process.env.MONGO_DB;
  const dryRun = Boolean(argv['dry-run'] || argv.dryRun);
  const confirm = Boolean(argv.confirm);
  const sourceCollName = 'educations';
  const targetCollName = 'education-section';

  if (!uri) {
    console.error('Missing --uri or MONGO_URI');
    process.exit(1);
  }
  if (!dbName) {
    console.error('Missing --db or MONGO_DB');
    process.exit(1);
  }

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const source = db.collection(sourceCollName);
    const target = db.collection(targetCollName);

    const cursor = source.find();
    let processed = 0;
    let inserted = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();

      const normalize = (v) => {
        if (v === undefined || v === null) return v;
        if (typeof v === 'string') return { es: v, en: v };
        if (typeof v === 'object' && (v.es || v.en)) return { es: v.es || v.en || '', en: v.en || v.es || '' };
        return { es: String(v), en: String(v) };
      };

      const newDoc = { ...doc };
      if (typeof newDoc.institution === 'string') newDoc.institution = normalize(newDoc.institution);
      if (typeof newDoc.title === 'string') newDoc.title = normalize(newDoc.title);
      if (typeof newDoc.description === 'string') newDoc.description = normalize(newDoc.description);

      newDoc.migratedFrom = sourceCollName;
      newDoc.migratedAt = new Date();

      const exists = await target.findOne({ _id: newDoc._id });
      processed++;
      console.log(`Doc _id=${newDoc._id} -> will be copied${exists ? ' (SKIPPED: exists)' : ''}`);

      if (!dryRun && confirm && !exists) {
        await target.insertOne(newDoc);
        inserted++;
        console.log(`Inserted _id=${newDoc._id} into ${targetCollName}`);
      }
    }

    console.log(`Processed ${processed} docs. Inserted: ${inserted} (dryRun=${dryRun}, confirm=${confirm})`);
  } catch (err) {
    console.error('Error during copy migration:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

main();
