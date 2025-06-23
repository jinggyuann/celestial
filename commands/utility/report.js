const { MessageEmbed, MessageActionRow, MessageAttachment, MessageButton } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const config = require("../../config");
const { error, convertMs, spaceGenerator} = require('../../functions');
exports.execute = async (client, message, args) => {
    const user = message.author

    try {
        const buttonUsageCheck = new Map();
        if ((db.get(`${user.id}.cd.report`) - Date.now()) > 0) {
            return message.reply(`Bello, you recently made an error report! As much we would like to hear from you, we need ensure that error report spams do not occur. Therefore, please wait ${convertMs(db.get(`${user.id}.cd.report`) - Date.now(), true)} before reporting an error again. Thank you for your support!`).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(err => {
                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                    }); 
                }, 7500);
            })
        } else if (!args[0]) {
            let missingarguments = new MessageEmbed()
            .setDescription("```\n" + db.get(`${message.guild.id}.prefix`) + "report <error>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "       ^^^^^^^\n```\n\n` - ` `<>` are required arguments")
            .setColor('#2e3036')

            return message.reply({
               embeds: [missingarguments],
               content: 'Missing required arguments!'
            })
        } else {
            try {
                db.set(`${user.id}.cd.report`, Date.now() + 60000)
                let report = args.join(' ')
                const row1 = new MessageActionRow()
                .addComponents(
                    yesReport = new MessageButton()
                    .setLabel('Yes')
                    .setCustomId('yesReport')
                    .setStyle('SUCCESS'),

                    noReport = new MessageButton()
                    .setLabel('No')
                    .setCustomId('noReport')
                    .setStyle('DANGER'),

                    editErrorReport = new MessageButton()
                    .setLabel('Edit Report Message')
                    .setCustomId('editErrorReport')
                    .setStyle('PRIMARY')
                )
                
                const row2 = new MessageActionRow()
                .addComponents(
                    endInteractionReport = new MessageButton()
                    .setLabel('End Interaction')
                    .setCustomId('endInteractionReport')
                    .setStyle('SECONDARY')
                )

                let confirmationEmbed = new MessageEmbed()
                .setTitle('Pending Confirmation')
                .setDescription(`Are you sure you want to send this error report? Do take note that if you send a false report message or send a report message for an unknown reason, you will be **blacklisted from using the report command**.\n\nReport Message:\n\n> ${'`' + report + '`'}\n\nClick on the corresponding buttons down below to make your selection.`)
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


                        if (interactionID === 'endInteractionReport') {
                            row1.components[0].setDisabled(true)
                            row1.components[1].setDisabled(true)
                            row1.components[2].setDisabled(true)
                            row2.components[0].setDisabled(true)
                            buttonUsageCheck.set('usingButtonREPORT', false)

                            botmsg.edit({
                                components: [row1, row2]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        } else if (buttonUsageCheck.get('usingButtonREPORT')) {
                            return;
                        } else if (interactionID === 'editErrorReport') {
                            try {
                                buttonUsageCheck.set('usingButtonREPORT', true)

                                const embed = new MessageEmbed()
                                .setTitle('Guide on editing your error report!')
                                .setDescription('Your error report must follow the requirements below:\n<a:greenright:924573404005285960> Must not exceed **1024 characters**.\n<a:greenright:924573404005285960> Must **include the error code** that is given. (Error code can be found at the bottom of an error message)\n\nIf you would like to cancel this action, just enter `CANCEL` as the error report.')
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
                                        
                                        let err = await msg.reply("Your error report must not exceed 1024 characters!");
    
                                        setTimeout(() => {
                                            err.delete().catch(err => {
                                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                            });
                                            msg.delete().catch(err => {
                                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                            });
                                        }, 3000);
                                    } else {
                                        report = content
                                        msg.react('<:celestialTick:994174510402121818>').catch(err => {
                                            console.log('[\x1b[33mWARNING\x1b[37m] Reaction cannot be added due to an error\n\n', err)
                                        });
    
                                        confirmationEmbed = new MessageEmbed()
                                        .setTitle('Pending Confirmation')
                                        .setDescription(`Are you sure you want to send this error report? Do take note that if you send a false report message or send a report message for an unknown reason, you will be **blacklisted from using the report command**.\n\nReport Message:\n\n> ${ '`' + report + '`'}\n\nClick on the corresponding buttons down below to make your selection.`)
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
                                        buttonUsageCheck.set('usingButtonREPORT', false)
                                        newbotmsg.delete().catch(err => {
                                            console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                        });
                                    }, 3000);
                                })
                            } catch(err) {
                                console.log(err)

                                error(message, 'REPORT_MESSAGE_PROCESS_ERR')
                            }
                        } else if (interactionID === 'yesReport') {
                            if (config.dev.includes(user.id)) {
                                db.set(`${user.id}.cd.report`, Date.now() + 30000)
                            } else {
                                db.set(`${user.id}.cd.report`, Date.now() + 43200000)
                            }
                            let success = new MessageEmbed()
                            .setTitle('Error Report Submitted Successfully!')
                            .setDescription(`Thank you for submitting an error report to help improve **${client.user.username}**! If you do find any other errors, feel free to report them. If you would like to give a suggestion to help further improve ${client.user.username}, feel free to use the ${ '`' + db.get(`${message.guild.id}.prefix`) + 'suggest`'} command!`)
                            .setColor('GREEN')
                            .setTimestamp()

                            let devEmbed = new MessageEmbed()
                            .setTitle('New Error Report!')
                            .setDescription(`Error Report Sent By: **${user.tag}** (${ '`' + user.id + '`'})\n\nError Report Origin Server: **${message.guild.name}** (${'`' + message.guild.id + '`'})\n\nError Report: ${'`' + report + '`'}`)
                            .setColor('RED')
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
                                }).catch(error => {
                                    console.log('[\x1b[33mWARNING\x1b[37m] Cannot send message to dev!' + '\n\nError: ', error);
                                })
                            }

                            botmsg.edit({
                                embeds: [success],
                                components: [row1, row2]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        } else if (interactionID === 'noReport') {
                            confirmationEmbed = new MessageEmbed()
                            .setTitle('Pending Confirmation')
                            .setDescription(`Are you sure you want to send this error report? Do take note that if you send a false report message or send a report message for an unknown reason, you will be **blacklisted from using ` + client.user.username + `**.\n\nReport Message:\n\n> ${'`' + report + '`'}\n\nClick on the corresponding buttons down below to make your selection.`)
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

                        error(message, 'REPORT_BUTTON_PROCESS_ERR')
                    }
                })
    
                collector.on('end', collected => {
                    buttonUsageCheck.set('usingButtonREPORT', false)
                    row1.components[0].setDisabled(true)
                    row1.components[1].setDisabled(true)
                    row1.components[2].setDisabled(true)
                    row2.components[0].setDisabled(true)

                    botmsg.edit({
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

                error(message, 'REPORT_BUTTON_ERR')
            }
        }
    } catch (err) {
        console.log(err)

        error(message, 'REPORT_ERR')
    }
}

exports.data = {
    name: "report",
    aliases: [],
    usage: `report [error]`
}