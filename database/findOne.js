async function serverFindOne(query) {
    const { MongoClient } = require('mongodb');
    const config = require('../config.js');
    const client = new MongoClient(config.mongoURI);
    
    await client.connect();

    try {
        const result = await client.db('main').collection('servers').findOne({ _id: query});

        return result;
    } catch (err) {
        console.log(err)
    } finally {
        client.close();
    }
}

module.exports = {serverFindOne}