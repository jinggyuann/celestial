//Set up new server data in mongoDB database
async function setNewServerData(serverID, data) { 
    const { MongoClient } = require('mongodb');
    const config = require('../config.js');
    const client = new MongoClient(config.mongoURI);
    await client.connect();
    console.log('\x1b[90m[DATABASE UPDATE] \x1b[37mConnected to the mongoDB database')

    try {
        // Checking if the server already has a present database
        const { serverFindOne } = require('./findOne.js');
        if (await serverFindOne(serverID)) {
            console.log(`\x1b[35m[MINOR ERROR]\x1b[37m The newly added server with id ${serverID} already has an existing database.`)
        } else {
            const result = await client.db("main").collection('servers').insertOne(data);
            console.log(`\x1b[35m[DATABASE UPDATE] \x1b[37mA new server's data has been added to the database with the id: ${result.insertedId}`)
        }
    } catch (err) {
        console.log(err)
    } finally {
        client.close();
    }
}

module.exports = { setNewServerData }