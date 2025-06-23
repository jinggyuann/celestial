const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const { error, convertMs } = require('../../functions');
exports.execute = async (client, message, args) => {
    const user = message.author

    try {
        if (db.get(`${user.id}.cd.snipe`) - Date.now() > 0) {
            return message.reply("Heh, how many messages are there to snipe? Take a chill pill and wait "+ convertMs(db.get(`${user.id}.cd.snipe`) - Date.now(), true) +" before sniping again.").then(msg => {
                setTimeout(() => {
                    msg.delete().catch(err => {
                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                    }); 
                }, 7500)
            });
        }

        // Replacing previous system
        if (db.has(`${message.guild.id}.snipe.content`) || db.has(`${message.guild.id}.snipe.author`) || db.has(`${message.guild.id}.snipe.timestamp`)) {
            db.delete(`${message.guild.id}.snipe`)
        }

        let nullCheck = db.get(`${message.guild.id}.snipe`)

        if (!nullCheck || nullCheck.length < 1) {
            return message.reply("There's nothing to snipe :>")
        } else {
            // Null Check
            for (let i = 0; i < nullCheck.length; i++) {
                if (nullCheck[i] == null || !nullCheck[i]) {
                    nullCheck.splice(i, 1)
                    db.subtract(`${message.guild.id}.snipeid`, 1)
        
                    db.set(`${message.guild.id}.snipe`, nullCheck)
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
        
                    db.set(`${message.guild.id}.snipe`, expireCheck)
                }
            }
        }

        let snipearr = db.get(`${message.guild.id}.snipe`)
        if (!db.has(`${message.guild.id}.snipe`) || db.get(`${message.guild.id}.snipe`).length <= 0) {
            return message.reply("There's nothing to snipe :>")
        } else {
            // Snipe Embed Creation
            let embedList = []
            for (let i = snipearr.length - 1; i >= 0; i--) {
                let item = snipearr[i]
                let targetuser = client.users.cache.find(user => user.id === item.author)
                let content = item.content
    
                if (!content) {
                    content = 'Content might be an embed or an image.'
                } else if (content.length > 1048) {
                    content = 'Snipe Content Exceeds `1048` characters.'
                }
    
                let snipeembed = new MessageEmbed()
                .setAuthor(`${targetuser.tag} (${targetuser.id})`, targetuser.displayAvatarURL())
                .setFooter(`Page ${snipearr.length - i} of ${snipearr.length} | Sniped by: ${user.username}#${user.discriminator}`)
                .setDescription(`${content}\n\nMessage sent on <t:${Math.floor(item.timestamp / 1000)}:D> at <t:${Math.floor(item.timestamp / 1000)}:T>\nMessage deleted on <t:${Math.floor(item.deletedAt / 1000)}:D> at <t:${Math.floor(item.deletedAt / 1000)}:T>`)
                .setColor('#53ABFF')
    
                embedList.push(snipeembed)
            }
            
            // Pagination
            const row = new MessageActionRow()
            .addComponents(
                firstpage = new MessageButton()
                .setCustomId('firstpagesnipe')
                .setEmoji("<:pleftmax:947712135096565780>")
                .setDisabled(true)
                .setStyle('PRIMARY'),
    
                previouspage = new MessageButton()
                .setCustomId('previouspagesnipe')
                .setEmoji('<:pleft:947713254627635230>')
                .setDisabled(true)
                .setStyle('PRIMARY'),
    
                nextpage = new MessageButton()
                .setCustomId('nextpagesnipe')
                .setEmoji("<:pright:947713128303587338>")
                .setDisabled(false)
                .setStyle('PRIMARY'),
    
                lastpage = new MessageButton()
                .setCustomId('lastpagesnipe')
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
                db.set(`${user.id}.cd.snipe`, Date.now() + 10000)
            } else {
                botmsg = await message.reply({
                    embeds: [embedList[currentpage]],
                    components: [row]
                })

                // Custom Cooldowns
                db.set(`${user.id}.cd.snipe`, Date.now() + 40000)
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
                    if (id === 'firstpagesnipe') {
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
                    } else if (id === 'previouspagesnipe') {
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
                    } else if (id === 'nextpagesnipe') {
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
                    } else if (id === 'lastpagesnipe') {
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
                            try {
                                botmsg.edit({
                                    components: []
                                }).catch(e => {
                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                })
                            } catch (err) {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + err)
                            }
                        }, 10000)
                    })
                } 
            })
        }
    } catch (err) {
        error(message, err, 'SNIPE_ERR')
    }
}

exports.data = {
    name: "snipe",
    aliases: [],
    usage: `snipe`
}