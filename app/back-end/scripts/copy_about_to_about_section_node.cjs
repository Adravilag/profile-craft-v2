#!/usr/bin/env node
/* CommonJS version for environments where package.json sets "type": "module" */
const { MongoClient } = require('mongodb');
const argv = require('minimist')(process.argv.slice(2));

async function main() {
  const uri = argv.uri || process.env.MONGO_URI;
  const dbName = argv.db || process.env.MONGO_DB;
  const dryRun = Boolean(argv['dry-run'] || argv.dryRun);
  const confirm = Boolean(argv.confirm);
  const sourceCollName = 'about-section';
  const targetCollName = 'about-section';

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

      // Transform helper: convert strings to { es, en }
      const normalize = (v) => {
        if (v === undefined || v === null) return v;
        if (typeof v === 'string') return { es: v, en: v };
        if (typeof v === 'object' && (v.es || v.en)) {
          return { es: v.es || v.en || '', en: v.en || v.es || '' };
        }
        return { es: String(v), en: String(v) };
      };

      const newDoc = { ...doc };

      // Apply normalization where needed
      if (typeof newDoc.aboutText === 'string') newDoc.aboutText = normalize(newDoc.aboutText);

      if (Array.isArray(newDoc.highlights)) {
        newDoc.highlights = newDoc.highlights.map(h => {
          const nh = { ...h };
          if (typeof nh.title === 'string') nh.title = normalize(nh.title);
          if (typeof nh.descriptionHtml === 'string') nh.descriptionHtml = normalize(nh.descriptionHtml);
          return nh;
        });
      }

      if (newDoc.collaborationNote) {
        const cn = { ...newDoc.collaborationNote };
        if (typeof cn.title === 'string') cn.title = normalize(cn.title);
        if (typeof cn.description === 'string') cn.description = normalize(cn.description);
        newDoc.collaborationNote = cn;
      }

      // Add metadata to track provenance
      newDoc.migratedFrom = sourceCollName;
      newDoc.migratedAt = new Date();

      // Prevent accidental overwrite: if a document with same _id exists in target, skip
      const exists = await target.findOne({ _id: newDoc._id });
      processed++;

      console.log(`Doc _id=${newDoc._id} -> will be copied${exists ? ' (SKIPPED: already exists in target)' : ''}`);

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
