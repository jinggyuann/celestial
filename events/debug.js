module.exports = (client, debug) => {

    try {
        if (!client.config.debug) {
            return;
        } else {
            console.log(debug)
        }
    } catch (err) {
        console.log(err)
    }
};