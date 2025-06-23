class Database {
    setNewServerData(serverID, data) {
        const { setNewServerData } = require('../database/setNewServerData')
        setNewServerData(serverID, data);
    }

    connectionTest() {
        const { connect } = require('../database/connect')
        connect();
    };
}

module.exports = { Database }



