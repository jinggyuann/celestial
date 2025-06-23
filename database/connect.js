// Testing connection between mongoDB and our discord client
async function connect() {
    const { MongoClient } = require('mongodb');
    const config = require('../config.js');
    const client = new MongoClient(config.mongoURI);

    try {
        //Connecting to the database
        await client.connect();
        console.log('\x1b[32m[SUCCESS] \x1b[37mSuccessfully connected to the mongoDB database.')
    } catch (err) {
        console.log(err)
    } finally {
        await client.close();
        console.log('\x1b[33m[WARNING]\x1b[37m Disconnected from mongoDB database.')
    }
}    

module.exports = { connect }