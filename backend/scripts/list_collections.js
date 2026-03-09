// scripts/list_collections.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function main(){
  const uri = process.env.MONGO_URI;
  if(!uri){
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }

  // New MongoDB driver doesn't accept `useUnifiedTopology` option.
  const client = new MongoClient(uri);
  try{
    await client.connect();
    // Try to extract DB name from the connection string (if provided)
    const dbNameMatch = uri.match(/\/([a-zA-Z0-9_-]+)(\?|$)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'test';
    console.log('Connected. Resolved DB name:', dbName);

    const db = client.db(dbName);
    const cols = await db.listCollections().toArray();
    if(cols.length === 0){
      console.log('No collections in database', db.databaseName);
    } else {
      console.log('Collections in', db.databaseName + ':');
      cols.forEach(c => console.log(' -', c.name));
    }

    // Also print databases that have data (optional)
    try{
      const admin = client.db().admin();
      const dblist = await admin.listDatabases();
      console.log('\nDatabases on server (showing names):');
      dblist.databases.forEach(d => console.log(' -', d.name));
    }catch(e){
      // ignore
    }

  }catch(err){
    console.error('Error connecting:', err.message);
  }finally{
    await client.close();
  }
}

main();
