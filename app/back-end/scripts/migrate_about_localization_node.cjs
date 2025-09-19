#!/usr/bin/env node
/* CommonJS version for environments where package.json sets "type": "module" */
const { MongoClient } = require('mongodb');
const argv = require('minimist')(process.argv.slice(2));

async function main() {
  const uri = argv.uri || process.env.MONGO_URI;
  const dbName = argv.db || process.env.MONGO_DB;
  const dryRun = Boolean(argv['dry-run'] || argv.dryRun);
  const confirm = Boolean(argv.confirm);

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
  // Use the hyphenated singular collection name 'about-section' in the 'profilecraft' db
  const coll = db.collection('about-section');

    const cursor = coll.find();
    let count = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const updates = {};

      // helper
      const normalize = (v) => {
        if (!v && v !== '') return undefined;
        if (typeof v === 'string') return { es: v, en: v };
        if (typeof v === 'object' && (v.es || v.en)) {
          return { es: v.es || v.en || '', en: v.en || v.es || '' };
        }
        return { es: String(v), en: String(v) };
      };

      if (typeof doc.aboutText === 'string') updates.aboutText = normalize(doc.aboutText);

      if (Array.isArray(doc.highlights)) {
        const newHighlights = doc.highlights.map(h => {
          const newH = { ...h };
          if (typeof newH.title === 'string') newH.title = normalize(newH.title);
          if (typeof newH.descriptionHtml === 'string') newH.descriptionHtml = normalize(newH.descriptionHtml);
          return newH;
        });
        updates.highlights = newHighlights;
      }

      if (doc.collaborationNote) {
        const cn = doc.collaborationNote;
        const newCN = { ...cn };
        if (typeof newCN.title === 'string') newCN.title = normalize(newCN.title);
        if (typeof newCN.description === 'string') newCN.description = normalize(newCN.description);
        updates.collaborationNote = newCN;
      }

      if (Object.keys(updates).length > 0) {
        count++;
        console.log(`Document _id=${doc._id} will be updated with keys: ${Object.keys(updates).join(', ')}`);
        if (!dryRun && confirm) {
          await coll.updateOne({ _id: doc._id }, { $set: updates });
          console.log(`Applied update to _id=${doc._id}`);
        }
      }
    }

    console.log(`Checked all docs. ${count} documents required updates.`);
    if (dryRun) console.log('Dry-run mode: no changes were applied. Re-run with --confirm to apply.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

main();
