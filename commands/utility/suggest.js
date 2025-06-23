const { MessageEmbed, MessageActionRow, MessageAttachment, MessageButton } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const config = require("../../config");
const { error, convertMs, spaceGenerator } = require('../../functions');
exports.execute = async (client, message, args) => {
    const user = message.author

    try {
        const buttonUsageCheck = new Map();
        if ((db.get(`${user.id}.cd.suggest`) - Date.now()) > 0) {
            return message.reply(`Bello, you recently made a suggestion! As much we would like to hear from you, we need ensure that suggestion spams do not occur. Therefore, please wait ${convertMs(db.get(`${user.id}.cd.suggest`) - Date.now(), true)} before suggesting again. Thank you for your support!`).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(err => {
                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                    }); 
                }, 7500);
            })
        } else if (!args[0]) {
            let missingarguments = new MessageEmbed()
            .setDescription("```\n" + db.get(`${message.guild.id}.prefix`) + "suggest <suggestion>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "        ^^^^^^^^^^^^\n```\n\n` - ` `<>` are required arguments")
            .setColor('#2e3036')

            return message.reply({
               embeds: [missingarguments],
               content: 'Missing required arguments!'
            })
        } else {
            try {
                db.set(`${user.id}.cd.suggest`, Date.now() + 60000)
                let suggestion = args.join(' ')
                const row1 = new MessageActionRow()
                .addComponents(
                    yesSuggest = new MessageButton()
                    .setLabel('Yes')
                    .setCustomId('yesSuggest')
                    .setStyle('SUCCESS'),

                    noSuggest = new MessageButton()
                    .setLabel('No')
                    .setCustomId('noSuggest')
                    .setStyle('DANGER'),

                    editErrorReport = new MessageButton()
                    .setLabel('Edit Suggestion')
                    .setCustomId('editSuggestion')
                    .setStyle('PRIMARY')
                )
                
                const row2 = new MessageActionRow()
                .addComponents(
                    endInteractionSuggest = new MessageButton()
                    .setLabel('End Interaction')
                    .setCustomId('endInteractionSuggest')
                    .setStyle('SECONDARY')
                )

                let confirmationEmbed = new MessageEmbed()
                .setTitle('Pending Confirmation')
                .setDescription(`Are you sure you want to submit this suggestion? Do take note that if you send a troll suggestion, it will result in punishment depending on the severity of the offense.\n\nSuggestion:\n\n> ${'`' + suggestion + '`'}\n\nClick on the corresponding buttons down below to make your selection.`)
                .setColor('#2e3036')

                let botmsg = await message.reply({
                    embeds: [confirmationEmbed],
                    components: [row1, row2]
                })

                const filter = i => i.user.id === user.id
        
                const collector = message.channel.createMessageComponentCollector(
                    {
                        filter, 
                        time: 40000
                    }
                )
    
                collector.on('collect', async interaction => {
                    try {
                        const interactionID = interaction.customId


                        if (interactionID === 'endInteractionSuggest') {
                            row1.components[0].setDisabled(true)
                            row1.components[1].setDisabled(true)
                            row1.components[2].setDisabled(true)
                            row2.components[0].setDisabled(true)

                            buttonUsageCheck.set('usingButtonSUGGEST', false)

                            botmsg.edit({
                                components: [row1, row2]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        } else if (buttonUsageCheck.get('usingButtonSUGGEST')) {
                            return;
                        } else if (interactionID === 'editSuggestion') {
                            try {
                                buttonUsageCheck.set('usingButtonSUGGEST', true)
                                const embed = new MessageEmbed()
                                .setTitle('Guide on editing your suggestion!')
                                .setDescription('Your error report must follow the requirements below:\n<a:greenright:924573404005285960> Must not exceed **1024 characters**.\n\nIf you would like to cancel this action, just enter `CANCEL` as the suggestion.')
                                .setColor('#F4C2C2')
    
                                let newbotmsg = await message.reply({
                                    embeds: [embed]
                                })
    
                                const filter = msg => msg.author.id === user.id
    
                                const msgcollector = message.channel.createMessageCollector(
                                    {
                                        filter,
                                        max: 1,
                                        time: 20000
                                    }
                                )
    
                                msgcollector.on('collect', async msg => {
                                    content = msg.content

                                    if (content === 'CANCEL') {
                                        msg.react('<:celestialTick:994174510402121818>').catch(err => {
                                            console.log('[\x1b[33mWARNING\x1b[37m] Reaction cannot be added due to an error\n\n', err)
                                        });

                                        let cancelaction = await msg.reply('Action Cancelled!')

                                        setTimeout(() => {
                                            msg.delete().catch(err => {
                                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                            });
                                            cancelaction.delete().catch(err => {
                                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                            });
                                        }, 3000)
                                    } else if (content.length > 1024) {
                                        msg.react('<:celestialError:994174557642575872>').catch(err => {
                                            console.log('Reaction cannot be added due to an error\n\n', err)
                                        });
                                        
                                        let err = await msg.reply("Your suggestion must not exceed `1024` characters!");
    
                                        setTimeout(() => {
                                            err.delete().catch(err => {
                                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                            });
                                            msg.delete().catch(err => {
                                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                            });
                                        }, 3000);
                                    } else {
                                        suggestion = content
                                        msg.react('<:celestialTick:994174510402121818>').catch(err => {
                                            console.log('[\x1b[33mWARNING\x1b[37m] Reaction cannot be added due to an error\n\n', err)
                                        });
    
                                        confirmationEmbed = new MessageEmbed()
                                        .setTitle('Pending Confirmation')
                                        .setDescription(`Are you sure you want to submit this suggestion? Do take note that if you send a troll suggestion, it will result in punishment depending on the severity of the offense.\n\nSuggestion:\n\n> ${'`' + suggestion + '`'}\n\nClick on the corresponding buttons down below to make your selection.`)
                                        .setColor('#2e3036')
    
                                        setTimeout(() => {
                                            botmsg.edit({
                                                embeds: [confirmationEmbed]
                                            }).catch(e => {
                                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                            })
                                            msg.delete().catch(err => {
                                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                            })
                                        }, 3000)
                                    }
                                })
    
                                msgcollector.on('end', collected => {
                                    setTimeout(() => {
                                        buttonUsageCheck.set('usingButtonSUGGEST', false)
                                        newbotmsg.delete().catch(err => {
                                            console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                        });
                                    }, 3000);
                                })
                            } catch(err) {
                                console.log(err)

                                error(message, 'SUGGEST_MESSAGE_PROCESS_ERR')
                            }
                        } else if (interactionID === 'yesSuggest') {
                            if (config.dev.includes(user.id)) {
                                db.set(`${user.id}.cd.report`, Date.now() + 30000)
                            } else {
                                db.set(`${user.id}.cd.report`, Date.now() + 43200000)
                            }
                            let success = new MessageEmbed()
                            .setTitle('Suggestion Submitted Successfully!')
                            .setDescription(`Thank you for submitting a suggestion to help improve **${client.user.username}**! If you found an error and would like to report it to help further improve ${client.user.username}, feel free to use the ${ '`' + db.get(`${message.guild.id}.prefix`) + 'report`'} command!`)
                            .setColor('GREEN')
                            .setTimestamp()

                            let devEmbed = new MessageEmbed()
                            .setTitle('New Suggestion!')
                            .setDescription(`Suggestion Sent By: **${user.tag}** (${ '`' + user.id + '`'})\n\nSuggestion Origin Server: **${message.guild.name}** (${'`' + message.guild.id + '`'})\n\nSuggestion: ${'`' + suggestion + '`'}`)
                            .setColor('GREEN')
                            .setThumbnail(message.author.displayAvatarURL())
                            .setTimestamp()

                            row1.components[0].setDisabled(true)
                            row1.components[1].setDisabled(true)
                            row1.components[2].setDisabled(true)
                            row2.components[0].setDisabled(true)

                            for (let i = 0; i < config.dev.length; i++) {
                                let dev = client.users.cache.find(u => u.id === config.dev[i])
                                dev.send({
                                    embeds: [devEmbed],
                                    content: `<@${dev.id}>`
                                }).catch(e => {
                                    console.log('[\x1b[33mWARNING\x1b[37m] Cannot send message to dev!' + '\n\nError: ', e);
                                })
                            }
                            
                            botmsg.edit({
                                embeds: [success],
                                components: [row1, row2]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        } else if (interactionID === 'noSuggest') {
                            confirmationEmbed = new MessageEmbed()
                            .setTitle('Pending Confirmation')
                            .setDescription(`Are you sure you want to submit this suggestion? Do take note that if you send a troll suggestion, it will result in punishment depending on the severity of the offense.\n\nSuggestion:\n\n> ${'`' + suggestion + '`'}\n\nClick on the corresponding buttons down below to make your selection.`)
                            .setColor('RED')

                            row1.components[0].setDisabled(true)
                            row1.components[1].setDisabled(true)
                            row1.components[2].setDisabled(true)
                            row2.components[0].setDisabled(true)

                            botmsg.edit({
                                embeds: [confirmationEmbed],
                                components: [row1, row2],
                                content: 'Action Cancelled!'
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        }
                    } catch (err) {
                        console.log(err)

                        error(message, 'SUGGEST_BUTTON_PROCESS_ERR')
                    }
                })
    
                collector.on('end', collected => {
                    if (collected.size <= 0) {
                        confirmationEmbed = new MessageEmbed()
                        .setTitle('Timeout!')
                        .setDescription(`Are you sure you want to submit this suggestion? Do take note that if you send a troll suggestion, it will result in punishment depending on the severity of the offense.\n\nSuggestion:\n\n> ${'`' + suggestion + '`'}\n\nClick on the corresponding buttons down below to make your selection.`)
                        .setColor('FFFF00')
                    }

                    buttonUsageCheck.set('usingButtonSUGGEST', false)
                    row1.components[0].setDisabled(true)
                    row1.components[1].setDisabled(true)
                    row1.components[2].setDisabled(true)
                    row2.components[0].setDisabled(true)

                    botmsg.edit({
                        embeds: [confirmationEmbed],
                        components: [row1, row2]
                    }).catch(e => {
                        return console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e);
                    }).then(botmsg => {
                        setTimeout(() => {
                            try {
                                botmsg.edit({
                                    components: []
                                }).catch(e => {
                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                })
                            } catch (err) {
                                return;
                            }
                        }, 10000)
                    })
                })
            } catch (err) {
                console.log(err)

                error(message, 'SUGGEST_BUTTON_ERR')
            }
        }
    } catch (err) {
        console.log(err)

        error(message, 'SUGGEST_ERR')
    }
}

exports.data = {
    name: "suggest",
    aliases: [],
    usage: `suggest [suggestion]`
}