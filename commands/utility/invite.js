const { MessageEmbed } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const config = require('../../config')
const { error, convertMs, cooldown } = require('../../functions');
exports.execute = async (client, message, args) => {
    const user = message.author

    try {
        if ((db.get(`${message.author.id}.cd.invite`) - Date.now()) > 0) {
            cooldown(message, db.get(`${message.author.id}.cd.invite`) - Date.now(), invite)
        } else {
            return message.reply(config.invite)
        }
    } catch (err) {
        console.log(err)

        error(message, 'UPTIME_ERR')
    }
}

exports.data = {
    name: "invite",
    aliases: [],
    usage: `c.invite`
}