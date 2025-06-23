const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const { error, convertMs, cooldown } = require('../../functions');
exports.execute = async (client, message, args) => {
    const user = message.author

    try {
        if (db.get(`${user.id}.cd.esnipe`) - Date.now() > 0) {
            return cooldown(message, db.get(`${user.id}.cd.esnipe`) - Date.now(), 'editsnipe')
        }
    
        // Replacing previous system
        if (db.has(`${message.guild.id}.esnipe.content`) || db.has(`${message.guild.id}.esnipe.author`) || db.has(`${message.guild.id}.esnipe.timestamp`)) {
            db.delete(`${message.guild.id}.esnipe`)
        }

        let nullCheck = db.get(`${message.guild.id}.editsnipe`)

        if (!nullCheck || nullCheck.length < 1) {
            return message.reply("There's nothing to snipe :>")
        } else {
            // Null Check
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

        let editsnipearr = db.get(`${message.guild.id}.editsnipe`)
        if (!db.has(`${message.guild.id}.editsnipe`) || db.get(`${message.guild.id}.editsnipe`).length <= 0) {
            return message.reply("There's nothing to snipe :>")
        } else {
            // Snipe Embed Creation
            let embedList = []
            for (let i = editsnipearr.length - 1; i >= 0; i--) {
                let item = editsnipearr[i]
                let targetuser = client.users.cache.find(user => user.id === item.author)
                let oldContent = item.oldContent
                let newContent = item.newContent
    
                if (!oldContent) {
                    oldContent = 'Content might be an embed or an image.'
                } else if (oldContent.length > 1048) {
                    oldContent = 'Previous content exceeds `1048` characters.'
                }

                if (!newContent) {
                    newContent = 'Content might be an embed or an image.'
                } else if (newContent.length > 1048) {
                    newContent = 'Edited content exceeds `1048` characters.'
                }
    
                let snipeembed = new MessageEmbed()
                .setAuthor(`${targetuser.tag} (${targetuser.id})`, targetuser.displayAvatarURL())
                .setFooter(`Page ${editsnipearr.length - i} of ${editsnipearr.length} | Sniped by: ${user.username}#${user.discriminator}`)
                .addFields(
                    {
                        name: 'Old Content',
                        value: oldContent,
                        inline: true
                    },
                    {
                        name: 'New Content',
                        value: newContent,
                        inline: true
                    },
                    {
                        name: '\u200B',
                        value: `Message sent on <t:${Math.floor(item.timestamp / 1000)}:D> at <t:${Math.floor(item.timestamp / 1000)}:T>\nMessage edited on <t:${Math.floor(item.editedAt / 1000)}:D> at <t:${Math.floor(item.editedAt / 1000)}:T>`
                    }
                )
                .setColor('#53ABFF')
    
                embedList.push(snipeembed)
            }
            
            // Pagination
            const row = new MessageActionRow()
            .addComponents(
                firstpage = new MessageButton()
                .setCustomId('firstpageeditsnipe')
                .setEmoji("<:pleftmax:947712135096565780>")
                .setDisabled(true)
                .setStyle('PRIMARY'),
    
                previouspage = new MessageButton()
                .setCustomId('previouspageeditsnipe')
                .setEmoji('<:pleft:947713254627635230>')
                .setDisabled(true)
                .setStyle('PRIMARY'),
    
                nextpage = new MessageButton()
                .setCustomId('nextpageeditsnipe')
                .setEmoji("<:pright:947713128303587338>")
                .setDisabled(false)
                .setStyle('PRIMARY'),
    
                lastpage = new MessageButton()
                .setCustomId('lastpageeditsnipe')
                .setEmoji('<:prightmax:947712150766510150>')
                .setDisabled(false)
                .setStyle('PRIMARY'),
    
            )
    
            let currentpage = 0
            let botmsg
    
            if (embedList.length == 1) {
                botmsg = await message.reply({
                    embeds: [embedList[currentpage]]
                })

                // Custom Cooldowns
                db.set(`${user.id}.cd.esnipe`, Date.now() + 10000)
            } else {
                botmsg = await message.reply({
                    embeds: [embedList[currentpage]],
                    components: [row]
                })

                // Custom Cooldowns
                db.set(`${user.id}.cd.esnipe`, Date.now() + 40000)
            }
    
            const filter = i => i.user.id === user.id
    
            const collector = message.channel.createMessageComponentCollector(
                {
                    filter,
                    time: 30000
                }
            )
    
            collector.on('collect', async interaction => {
                try {
                    const id = interaction.customId
                    if (id === 'firstpageeditsnipe') {
                        currentpage = 0
                        row.components[0].setDisabled(true)
                        row.components[1].setDisabled(true)
                        row.components[2].setDisabled(false)
                        row.components[3].setDisabled(false)
    
                        botmsg.edit({
                            embeds: [embedList[currentpage]],
                            components: [row]
                        }).catch(e => {
                            console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                        })
                    } else if (id === 'previouspageeditsnipe') {
                        currentpage = currentpage - 1
                        if (currentpage <= 0) {
                            row.components[0].setDisabled(true)
                            row.components[1].setDisabled(true)
                            row.components[2].setDisabled(false)
                            row.components[3].setDisabled(false)
    
                            botmsg.edit({
                                embeds: [embedList[currentpage]],
                                components: [row]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        } else {
                            row.components[0].setDisabled(false)
                            row.components[1].setDisabled(false)
                            row.components[2].setDisabled(false)
                            row.components[3].setDisabled(false)
    
                            botmsg.edit({
                                embeds: [embedList[currentpage]],
                                components: [row]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        }
                    } else if (id === 'nextpageeditsnipe') {
                        currentpage = currentpage + 1
    
                        if (currentpage >= embedList.length - 1) {
                            row.components[0].setDisabled(false)
                            row.components[1].setDisabled(false)
                            row.components[2].setDisabled(true)
                            row.components[3].setDisabled(true)
    
                            botmsg.edit({
                                embeds: [embedList[currentpage]],
                                components: [row]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        } else {
                            row.components[0].setDisabled(false)
                            row.components[1].setDisabled(false)
                            row.components[2].setDisabled(false)
                            row.components[3].setDisabled(false)
    
                            botmsg.edit({
                                embeds: [embedList[currentpage]],
                                components: [row]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        }
                    } else if (id === 'lastpageeditsnipe') {
                        currentpage = embedList.length - 1
    
                        row.components[0].setDisabled(false)
                        row.components[1].setDisabled(false)
                        row.components[2].setDisabled(true)
                        row.components[3].setDisabled(true)
    
                        botmsg.edit({
                            embeds: [embedList[currentpage]],
                            components: [row]
                        }).catch(e => {
                            console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                        })
                    }
                } catch (err) {
                    error(message, err, 'SNIPE_PAGINATION_ERR')
                }
            })
    
            collector.on('end', collected => {
                if (collected.size > 0) {
                    row.components[0].setDisabled(true)
                    row.components[1].setDisabled(true)
                    row.components[2].setDisabled(true)
                    row.components[3].setDisabled(true)
        
                    botmsg.edit({
                        components: [row]
                    }).catch(e => {
                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                    }).then(botmsg => {
                        setTimeout(() => {
                            botmsg.edit({
                                components: []
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        }, 10000)
                    })
                } 
            })
        }
    } catch (err) {
        console.log(err)

        error(message, 'EDITSNIPE_ERR')
    }
}

exports.data = {
    name: "editsnipe",
    aliases: ["esnipe"],
    usage: `esnipe`
}