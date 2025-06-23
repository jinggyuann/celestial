const db = require('quick.db');

module.exports = async (client, message) => {
    let maxmsg = 15
    try {
        if (db.get(`${message.author.id}.cd.commands`) - Date.now() > 0) { //Prevent Bot from getting rate limited
            return;
        } else if (!message) {
            return;
        } else if (!message.content || message.author.bot || message.author.id == client.user.id) {
            return;
        } else {
            // Setting up message sniping IDs & initializing if there is none present
            if (!db.has(`${message.guild.id}.snipeid`) || isNaN(db.get(`${message.guild.id}.snipeid`)) || db.get(`${message.guild.id}.snipeid`) < 0) {
                db.set(`${message.guild.id}.snipeid`, 0)
            } 

            // Replacing previous system
            if (db.has(`${message.guild.id}.snipe.content`) || db.has(`${message.guild.id}.snipe.author`) || db.has(`${message.guild.id}.snipe.timestamp`)) {
                db.delete(`${message.guild.id}.snipe`)
            }
 
            // Adding the snipe to the Database
            db.set(`${message.author.id}.cd.commands`, Date.now() + 1000)
            db.set(`${message.guild.id}.snipe.${db.get(`${message.guild.id}.snipeid`)}.content`, message.content)
            db.set(`${message.guild.id}.snipe.${db.get(`${message.guild.id}.snipeid`)}.timestamp`, message.createdTimestamp)
            db.set(`${message.guild.id}.snipe.${db.get(`${message.guild.id}.snipeid`)}.author`, message.author.id)
            db.set(`${message.guild.id}.snipe.${db.get(`${message.guild.id}.snipeid`)}.deletedAt`, Date.now())
            
            db.add(`${message.guild.id}.snipeid`, 1)

            // Controlling maximum number of sniped messages
            let maxsnipemsg = db.get(`${message.guild.id}.snipe`)
            let count = db.get(`${message.guild.id}.snipeid`)

            if (count > maxmsg) {
                maxsnipemsg.shift()
                db.subtract(`${message.guild.id}.snipeid`, 1)

                db.set(`${message.guild.id}.snipe`, maxsnipemsg)
            }

            // Snipe Expire Check & Null Check
            let nullCheck = db.get(`${message.guild.id}.snipe`)

            for (let i = 0; i < nullCheck.length; i++) {
                if (nullCheck[i] == null || !nullCheck[i]) {
                    nullCheck.splice(i, 1)
                    db.subtract(`${message.guild.id}.snipeid`, 1)

                    return db.set(`${message.guild.id}.snipe`, nullCheck)
                }
            }
            
            // Expire Check
            let expireCheck = db.get(`${message.guild.id}.snipe`)
            
            for (let i = 0; i < expireCheck.length; i++) {
                let item = expireCheck[i]
                let timecheck = parseInt(Date.now() - item.deletedAt)

                if (timecheck > 21600000) {
                    expireCheck.splice(i, 1)
                    db.subtract(`${message.guild.id}.snipeid`, 1)

                    return db.set(`${message.guild.id}.snipe`, expireCheck)
                }
            }
        }
    } catch (err) {
        console.log(err)
    }
}