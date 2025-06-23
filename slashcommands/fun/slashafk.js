const { SlashCommandBuilder } = require("@discordjs/builders");
const client = require("../../index.js")
const db = require('quick.db');
const components = require('../../components');
const { interactionDefer, slashError, convertMs } = require('../../functions');
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('afk')
	.setDescription('Let the members in your server know that you are currently AFK!')
    .setDMPermission(false)
    .addStringOption(option =>
        option.setName('message')
            .setDescription('The custom message that will be sent when you get pinged while in AFK mode')
            .setRequired(false)
    ),

    async execute(client, interaction) {
        try {
            const user = interaction.user
            let afkMessage = interaction.options.getString('message')
            let nick 

            if (!interaction.guild) {
                return interactionDefer(interaction, true).then(() => {
                    let erremebed = new MessageEmbed()
                    .setDescription('<:celestialError:994174557642575872> This command cannot be used in direct messages.')
                    .setColor('RED')

                    return interaction.editReply({
                        embeds: [erremebed]
                    }).catch(e => {
                        return console.log(e)
                    })
                })
            }

            if (!db.has(`${user.id}.${interaction.guild.id}.afk`)) {
                db.set(`${user.id}.${interaction.guild.id}.afk.status`, false)
                db.set(`${user.id}.${interaction.guild.id}.afk.message`, 'AFK')
                db.set(`${user.id}.${interaction.guild.id}.afk.timestamp`, Date.now())
            }
        
            if (!afkMessage) {
                afkMessage = 'AFK'
            }
        
            if (afkMessage.length > 1024) {
                interactionDefer(interaction, true).then(() => {
                    return interaction.editReply('Message length cannot exceed `1,048` characters!').catch(e => {
                        console.log(e)
                    });
                })
            }

            let settingafklist = [
                `<a:baibai:923786180900818955> <@${user.id}> I have set your AFK message to: ${afkMessage}`,
                `<a:baibai:923786180900818955> Looks like <@${user.id}> is going AFK! I have set your AFK message to: ${afkMessage}`,
                `<a:baibai:923786180900818955> Byeeeee <@${user.id}>! Your AFK message has been set to: ${afkMessage}`
            ]
    
            let comingbacklist = [
                `<a:cutewave:923784318084583445> Heya <@${user.id}>! It's nice to see you again, I have removed your AFK status.`,
                `<a:cutewave:923784318084583445> Welcome back <@${user.id}>! I have removed your AFK status.`,
                `<@${user.id}> you came back :D! Your AFK status has been removed.`
            ]
    
            let comingback = comingbacklist[Math.floor(Math.random() * comingbacklist.length)]
            let settingafk = settingafklist[Math.floor(Math.random() * settingafklist.length)]
    
            if (db.get(`${user.id}.cd.afk`) - Date.now() > 0) {
                return interactionDefer(interaction, true).then(() => {
                    return interaction.editReply('Tsk Tsk Tsk, so you lied about going AFK <:bruh:923946086740144128>... Just for that, you will wait '+ convertMs(db.get(`${user.id}.cd.afk`) - Date.now(), true, false) +' before using the command again.')
                }).catch(e => {
                    console.log(e)
                });
            }
    
            db.set(`${user.id}.cd.afk`, Date.now() + 10000)
            if (db.get(`${user.id}.${interaction.guild.id}.afk.status`) == true) {
                if (interaction.member.roles.highest.position >= interaction.guild.members.resolve(client.user).roles.highest.position || interaction.ownerID == interaction.user.id) {
                    db.set(`${user.id}.${interaction.guild.id}.afk.status`, false) 

                    interactionDefer(interaction, false).then(() => {
                        interaction.editReply(comingback).catch(e => {
                            console.log(e)
                        }).then(() => {
                            setTimeout(() => {
                                interaction.deleteReply().catch(e => {
                                    console.log(e)
                                });
                            }, 10000)
                        })
                    })
                } else {
                    db.set(`${user.id}.${interaction.guild.id}.afk.status`, false) 
                    if (interaction.member.displayName.startsWith('[AFK] ')) {
                        nick = interaction.member.displayName.split('[AFK] ')[1]
                    } else {
                        nick = message.member.displayName
                    }
        
                    try {
                        interaction.member.setNickname(nick)
                    } catch (err) {
                        console.log(err)
        
                        slashError(interaction, err, true, 'SLASHAFK_NICKNAME_EDIT_ERR')
                    }

                    interactionDefer(interaction, false).then(() => {
                        interaction.editReply(comingback).catch(e => {
                            return console.log(e)
                        }).then(() => {
                            setTimeout(() => {
                                interaction.deleteReply().catch(e => {
                                    console.log(e)
                                });
                            }, 10000)
                        })
                    })
                }
            } else { //Setting AFK
                if (interaction.member.roles.highest.position >= interaction.guild.members.resolve(client.user).roles.highest.position || interaction.guild.ownerID == interaction.user.id) {
                    db.set(`${user.id}.${interaction.guild.id}.afk.status`, true)
                    db.set(`${user.id}.${interaction.guild.id}.afk.message`, afkMessage)
                    db.set(`${user.id}.${interaction.guild.id}.afk.timestamp`, Date.now())
    
                    interactionDefer(interaction, false).then(() => {
                        return interaction.editReply(settingafk).catch(e => {
                            console.log(e)
                        });
                    })
                } else {
                    db.set(`${user.id}.${interaction.guild.id}.afk.status`, true)
                    db.set(`${user.id}.${interaction.guild.id}.afk.message`, afkMessage)
                    db.set(`${user.id}.${interaction.guild.id}.afk.timestamp`, Date.now())
        
                    if (interaction.member.displayName.startsWith('[AFK] ')) {
                        nick = interaction.member.displayName
                    } else if (interaction.member.displayName.length + 6 > 32){
                        nick = interaction.member.displayName
                    } else {
                        nick = `[AFK] ${interaction.member.displayName}`
                    }
    
                    try {
                        interaction.member.setNickname(nick)

                        interactionDefer(interaction, false).then(() => {
                            interaction.editReply(settingafk).catch(e => {
                                console.log(e)
                            });
                        })
                    } catch (err) {
                        console.log(err)
        
                        slashError(interaction, err, true, 'SLASHAFK_NICKNAME_EDIT_ERR')
                    }
                }
            }
        } catch (err) {
            slashError(interaction, err, true, 'SLASHAFK_SETUP_GENERAL_ERR')
        }
    }
}
