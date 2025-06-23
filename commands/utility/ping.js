const { MessageEmbed } = require("discord.js");

const db = require('quick.db');
const components = require('../../components');
const error = require('../../functions');

exports.execute = async (client, message, args) => {
    try {
        const user = message.author

        if (db.get(`${user.id}.cd.ping`) - Date.now() > 0) {
            return;
        } else {
            db.set(`${user.id}.cd.ping`, Date.now() + 3000)
            message.channel.send("Boinking Discord...").then(msg =>{
                let apilatency = Math.round(client.ws.ping, 0)
                let latency = msg.createdTimestamp - message.createdTimestamp;
    
                msg.edit(`🏓 Pong! **${client.user.username}** has a ` + '`' + latency + 'ms`' + ` ping to you and a ` + '`' + apilatency + 'ms`' + ` ping to Discord!`)
            });
        }
    } catch (err) {
        console.log(err)

        error(message, 'PING_GENERAL')
    }
}

exports.data = {
    name: "ping",
    aliases: ["ping"],
    usage: `ping`
}