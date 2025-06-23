const { MessageEmbed } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const { error, convertMs } = require('../../functions');
exports.execute = async (client, message, args) => {
    const user = message.author

    try {
        if (db.get(`${user.id}.cd.uptime`) - Date.now() > 0) {
            return;
        } 
        
        db.set(`${user.id}.cd.uptime`, Date.now() + 5000)
        return message.reply(`<a:online:923826409359687710> **${client.user.username}** has been online for ${convertMs(client.uptime, true)}!`)
    } catch (err) {
        console.log(err)

        error(message, 'UPTIME_ERR')
    }
}

exports.data = {
    name: "uptime",
    aliases: [],
    usage: `uptime`
}