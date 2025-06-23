const db = require('quick.db');

module.exports = (client, oldMessage, newMessage) => {
    let maxmsg = 15
    let message = newMessage

    try {
        if (!oldMessage || !newMessage || !oldMessage.guild || !newMessage.guild) {
            return;
        } else if (oldMessage.author.id !== newMessage.author.id || oldMessage.guild.id !== newMessage.guild.id || !oldMessage.content || !newMessage.content) {
            return;
        } else if (oldMessage.content == newMessage.content || (oldMessage.author.bot && newMessage.author.bot)) {
            return;
        } else {
            // Setting up message sniping IDs & initializing if there is none present
            if (!db.has(`${message.guild.id}.editsnipeid`) || isNaN(db.get(`${message.guild.id}.editsnipeid`)) || db.get(`${message.guild.id}.editsnipeid`) < 0) {
                db.set(`${message.guild.id}.editsnipeid`, 0)
            } 

            // Replacing previous system
            if (db.has(`${message.guild.id}.esnipe.content`) || db.has(`${message.guild.id}.esnipe.author`) || db.has(`${message.guild.id}.esnipe.timestamp`)) {
                db.delete(`${message.guild.id}.esnipe`)
            }
 
            // Adding the snipe to the Database
            db.set(`${message.author.id}.cd.commands`, Date.now() + 1000)
            db.set(`${message.guild.id}.editsnipe.${db.get(`${message.guild.id}.editsnipeid`)}.oldContent`, oldMessage.content)
            db.set(`${message.guild.id}.editsnipe.${db.get(`${message.guild.id}.editsnipeid`)}.newContent`, newMessage.content)
            db.set(`${message.guild.id}.editsnipe.${db.get(`${message.guild.id}.editsnipeid`)}.timestamp`, oldMessage.createdTimestamp)
            db.set(`${message.guild.id}.editsnipe.${db.get(`${message.guild.id}.editsnipeid`)}.author`, newMessage.author.id)
            db.set(`${message.guild.id}.editsnipe.${db.get(`${message.guild.id}.editsnipeid`)}.editedAt`, Date.now())
            
            db.add(`${message.guild.id}.editsnipeid`, 1)

            // Controlling maximum number of sniped messages
            let maxsnipemsg = db.get(`${message.guild.id}.editsnipe`)
            let count = db.get(`${message.guild.id}.editsnipeid`)

            if (count > maxmsg) {
                maxsnipemsg.shift()
                db.subtract(`${message.guild.id}.editsnipeid`, 1)

                db.set(`${message.guild.id}.editsnipe`, maxsnipemsg)
            }

            // Snipe Expire Check & Null Check
            let nullCheck = db.get(`${message.guild.id}.editsnipe`)

            for (let i = 0; i < nullCheck.length; i++) {
                if (nullCheck[i] == null || !nullCheck[i]) {
                    nullCheck.splice(i, 1)
                    db.subtract(`${message.guild.id}.editsnipeid`, 1)

                    return db.set(`${message.guild.id}.editsnipe`, nullCheck)
                }
            }
            
            // Expire Check
            let expireCheck = db.get(`${message.guild.id}.editsnipe`)
            
            for (let i = 0; i < expireCheck.length; i++) {
                let item = expireCheck[i]
                let timecheck = parseInt(Date.now() - item.deletedAt)

                if (timecheck > 21600000) {
                    expireCheck.splice(i, 1)
                    db.subtract(`${message.guild.id}.editsnipeid`, 1)

                    return db.set(`${message.guild.id}.editsnipe`, expireCheck)
                }
            }
        }
    } catch (err) {
        console.log(err)
    }
} 