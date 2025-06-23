const { MessageEmbed } = require("discord.js");
const db = require('quick.db');
const config = require('../../config');
const { error, convertMs, spaceGenerator } = require('../../functions');
exports.execute = async (client, message, args) => {

    const user = message.author

    if (!args[0]) {
        return message.reply(`My prefix for **${message.guild.name}** is ` + "`" +db.get(`${message.guild.id}.prefix`)+ "`!")
    } else {
        try {
            if (args[0].toLowerCase() == 'set' || args[0].toLowerCase() == 'edit') {
                if (!message.member.permissions.has('MANAGE_GUILD')) {
                    return message.reply("You need the `Manage Server` permissions to change the server's prefix!")
                } else if ((db.get(`${message.guild.id}.cd.prefix`) - Date.now()) > 0) {
                    return message.reply(`<:sippingboba:924506659907317820> Hmm... How many prefixes can one server have? **${message.guild.name}**'s prefix has recently been changed. Please wait for another ` + `${convertMs(db.get(`${message.guild.id}.cd.prefix`) - Date.now(), true)}` + ` before changing the server's prefix again!`).then(msg => {
                        setTimeout(() => {
                            msg.delete().catch(err => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                            });
                        }, 7500)
                    });
                } else if (!args[1]) {
                    let embed = new MessageEmbed()
                    .setDescription("```\n"+ `${db.get(`${message.guild.id}.prefix`)}` +"prefix set <prefix>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "           ^^^^^^^^\n          missing <prefix>```")
                    .setFooter('<> Required Arguments || [] Optional Arguments')
    
                    return message.reply({
                        embeds: [embed]
                    })
                } else if (args[1].length > 10 || args[1].length < 1) {
                    return message.reply('Your prefix cannot be more than `10` or less than `1` characters!')
                } else if (args[1] == db.get(`${message.guild.id}.prefix`)) {
                    return message.reply('The current server prefix is already `' + args[1] + '`. Try changing the prefix to something other than `' + args[1] + '`!')
                } else {
    
                    db.set(`${message.guild.id}.cd.prefix`, (Date.now() + 60000))
    
                    let failembed = new MessageEmbed()
                    .setAuthor(`${user.username}#${user.discriminator}`, user.displayAvatarURL())
                    .setDescription(`<:celestialError:994174557642575872> An error has occured! Prefix has not been changed because an internal error has occured, please report this error as soon as possible!`)
                    .setColor('RED')
                
                    try {
                        db.set(`${message.guild.id}.prefix`, args[1].toLowerCase())
    
                        let successembed = new MessageEmbed()
                        .setAuthor(`${user.username}#${user.discriminator}`, user.displayAvatarURL())
                        .setDescription(`<:celestialTick:994174510402121818> **${message.guild.name}**'s prefix has successfully been changed to ` + "`" + `${db.get(`${message.guild.id}.prefix`)}` + "`!")
                        .setColor('GREEN')
    
                        return message.reply({
                            embeds: [successembed],
                        })
                    } catch (err) {
                        console.log(err)
    
                        return message.reply({
                            embeds: [failembed]
                        })
                    }
                }
            } else {
                return message.reply(`My prefix for **${message.guild.name}** is ` + "`" +db.get(`${message.guild.id}.prefix`)+ "`!")
            }
        } catch (err) {
            console.log(err)
    
            error(message, 'PREFIX_SET_ERR')
        }
    }
}

exports.data = {
    name: "prefix",
    aliases: ["prefix"],
    usage: `prefix set <prefix>`
}