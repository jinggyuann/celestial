const { SlashCommandBuilder } = require("@discordjs/builders");
const client = require("../../index.js")
const db = require('quick.db');
const components = require('../../components');
const { interactionDefer, typeCheck, slashError, autoDelete, interactionUserPermissionCheck } = require("../../functions.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('autoreaction')
	.setDescription('Autoreactions that will send a custom message when a trigger word is sent')
    .setDMPermission(false)
	.addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Add a new autoreaction to your server')
            .addStringOption(option => 
                option.setName('trigger')
                    .setDescription('The trigger word that will send the reaction message of the given trigger')
                    .setRequired(true)
                )

            .addStringOption(option => 
                option.setName('reaction')
                    .setDescription('The reaction message that will be sent when the trigger word is said')
                    .setRequired(true)
            )

            .addStringOption(option => 
                option.setName('type')
                    .setRequired(false)
                    .setDescription('The type of autoreaction. Basically how the trigger word is said')
                    .addChoices(
                        { name: 'NORMAL', value: '1' },
                        { name: 'NORMAL_WORD', value: '2' },
                        { name: 'EXACT', value: '3' },
                        { name: 'STARTS_WITH', value: '4' },
                        { name: 'ENDS_WITH', value: '5' },
                        { name: 'STARTS_WITH_FULL', value: '6' },
                        { name: 'ENDS_WITH_FULL', value: '7' }
                    )
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('edit')
            .setDescription('Edit an existing autoreaction to your server.')
            .addStringOption(option => 
                option.setName('target')
                    .setDescription('The trigger word of the autoreaction you wish to edit')
                    .setRequired(true)
                    .setAutocomplete(true)
                )

            .addStringOption(option => 
                option.setName('reaction')
                    .setDescription('The new reaction message')
                    .setRequired(false)
            )

            .addStringOption(option => 
                option.setName('type')
                    .setRequired(false)
                    .setDescription('The new type of autoreaction. Basically how the trigger word is said')
                    .addChoices(
                        { name: 'NORMAL', value: '1' },
                        { name: 'NORMAL_WORD', value: '2' },
                        { name: 'EXACT', value: '3' },
                        { name: 'STARTS_WITH', value: '4' },
                        { name: 'ENDS_WITH', value: '5' },
                        { name: 'STARTS_WITH_FULL', value: '6' },
                        { name: 'ENDS_WITH_FULL', value: '7' }
                    )
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('delete')
            .setDescription('Remove an existing autoreaction to your server.')
            .addStringOption(option => 
                option.setName('target')
                    .setDescription('The trigger of the autoreaction that will be removed')
                    .setRequired(true) 
                    .setAutocomplete(true)                 
                )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('view')
            .setDescription('Check out all the available autoreactions in your server')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('info')
            .setDescription('Get the information of an autoreaction')
            .addStringOption(option => 
                option.setName('target')
                    .setDescription("The autoreaction's information that will be shown")
                    .setRequired(true)
                    .setAutocomplete(true)
            )
    ),

    async execute(client, interaction) {
        try {
            if (!interaction.guild) {
                return interactionDefer(interaction, true).then(() => {
                    let errembed = new MessageEmbed()
                    .setDescription('<:celestialError:994174557642575872> This command cannot be used in direct messages.')
                    .setColor('RED')

                    return interaction.editReply({
                        embeds: [errembed]
                    }).catch(e => {
                        return console.log(e)
                    })
                })
            }

            if (!interactionUserPermissionCheck(interaction, interaction.user.id, 'MANAGE_GUILD')) {
                return interactionDefer(interaction, true).then(() => {
                    let erremebed = new MessageEmbed()
                    .setDescription('<:celestialError:994174557642575872> You must have the `MANAGE_GUILD` permission to be able to use this command!')
                    .setColor('RED')

                    return interaction.editReply({
                        embeds: [erremebed]
                    }).catch(e => {
                        return console.log(e)
                    })
                })
            }

            const user = interaction.user
            let subCommand = interaction.options.getSubcommand()

            if (subCommand == 'add') {
                let trigger = interaction.options.getString('trigger')
                let reaction = interaction.options.getString('reaction')
                let type = interaction.options.getString('type')
                let arlimit = 50

                try {
                    if (db.has(`${interaction.guild.id}.arlist`) && db.get(`${interaction.guild.id}.arlist`).length > arlimit) {
                        return interactionDefer(interaction, true).then(() => {
                            return interaction.editReply(`**${interaction.guild.name}** has hit it's limit of ${'`' + arlimit + '`'} auto reaction! Please delete a previous auto reaction before adding another.`).catch(e => {
                                return console.log(e)
                            })
                        })
                    } else {
                        if (type == 4 || type == 5) {
                            trigger = trigger.split(' ')
                            if (trigger.length > 1) {
                                let embed = new MessageEmbed()
                                .setDescription('<:celestialError:994174557642575872> Autoreaction triggers for types `STARTS_WITH` and `ENDS_WITH` cannot include spaces!')
                                .setColor('RED')
    
                                return interactionDefer(interaction, true).then(() => {
                                    return interaction.editReply({
                                        embeds: [embed]
                                    }).catch(e => {
                                        return console.log(e)
                                    })
                                })
                            }
                            trigger = trigger.join(' ');
                        }
        
                        let footers = [
                            'You can get the full guide on using autoreactions at `' + db.get(`${interaction.guild.id}.prefix`) + 'help autoreaction`!',
                            'Check out `' + db.get(`${interaction.guild.id}.prefix`) + 'help autoreaction types` if you are not familiar with ' + client.user.username + "'s autoreaction type feature!",
                            'Autoreactions is quite difficult to fully understand therefore you can get further documentations on autoreaction subcommands via `' + db.get(`${interaction.guild.id}.prefix`) + 'help autoreaction <sub-command>`!'
                        ]
        
                        let footer = footers[Math.floor(Math.random() * footers.length)]
                        if (!db.has(`${interaction.guild.id}.ar.${trigger.toLowerCase()}`)) {
                            if (reaction.length >= 1 && reaction.length <= 1000 && trigger.length <= 100) { 
                                if (!type) {
                                    type = 1
                                }
        
                                db.set(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.reaction`, `${reaction}`)
                                db.set(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.type`, type)
                                db.push(`${interaction.guild.id}.arlist`, `${trigger.toLowerCase()}`)
                                
                                let embed = new MessageEmbed()
                                .setTitle('Successfully added a new autoreaction!')
                                .addFields(
                                    {
                                        name: "**<:tehopeng:950389690115170315> Autoreaction Info**",
                                        value: "\u200b"
                                    },
                                    {
                                        name: "<:kannabeingkanna:950390490778460220> Trigger",
                                        value: `${trigger}`,
                                        inline: true
                                    },
                                    {
                                        name: "<:sovabeingsova:950391661580652595> Reaction" ,
                                        value: `${db.get(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.reaction`)}`,
                                        inline: true
                                    },
                                    {
                                        name: "<:cutehutao:950402587788738570>  Raw Reaction",
                                        value: "`" + db.get(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.reaction`) + "`",
                                        inline: true
                                    },
                                    {
                                        name: "<:jett:950391180024234045> Type",
                                        value: '`' + typeCheck(db.get(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.type`)) + '`',
                                        inline: true
                                    }
                                )
                                .setFooter(footer)
                                .setColor('GREEN')
                                .setAuthor(user.username, user.displayAvatarURL())
                                
                                db.set(`${user.id}.cd.ar`, Date.now() + 20000)

                                interactionDefer(interaction, false).then(() => {
                                    interaction.editReply({
                                        embeds: [embed]
                                    }).catch(e => {
                                        return console.log(e)
                                    })
                                })
                            } else {
                                if (reaction.length > 1000) {
                                    interactionDefer(interaction, true).then(() => {
                                        let erremebed = new MessageEmbed()
                                        .setDescription('<:celestialError:994174557642575872> Reaction length cannot exceed `1,000` characters!')
                                        .setColor('RED')
                    
                                        return interaction.editReply({
                                            embeds: [erremebed]
                                        }).catch(e => {
                                            return console.log(e)
                                        })
                                    })
                                } else if (reaction.length < 1) {
                                    interactionDefer(interaction, true).then(() => {
                                        let erremebed = new MessageEmbed()
                                        .setDescription('<:celestialError:994174557642575872> Reaction length cannot be less than `1` character!')
                                        .setColor('RED')
                    
                                        return interaction.editReply({
                                            embeds: [erremebed]
                                        }).catch(e => {
                                            return console.log(e)
                                        })
                                    })
                                } else if (trigger.length > 100) {
                                    interactionDefer(interaction, true).then(() => {
                                        let erremebed = new MessageEmbed()
                                        .setDescription('<:celestialError:994174557642575872> Trigger length cannot exceed `100` characters!')
                                        .setColor('RED')
                    
                                        return interaction.editReply({
                                            embeds: [erremebed]
                                        }).catch(e => {
                                            return console.log(e)
                                        })
                                    })
                                } else {
                                    console.log('[\x1b[33mWARNING\x1b[37m] An error has occured while replying to invalid reaction & trigger lengths!')

                                    slashError(interaction, err, true, 'AUTOREACTION_INVALID_RTLENGTH_ERR')
                                }
                            }
                        } else if (db.has(`${interaction.guild.id}.ar.${trigger.toLowerCase()}`)) {
                            interactionDefer(interaction, true).then(() => {
                                let erremebed = new MessageEmbed()
                                .setDescription('<:celestialError:994174557642575872>' + ` ${'`' + trigger.toLowerCase() + '` is an existing autoreaction. You can either delete it with the `/autoreaction delete` slash command or edit it with the `/autoreaction edit` slash command.'}`)
                                .setColor('RED')
            
                                return interaction.editReply({
                                    embeds: [erremebed]
                                }).catch(e => {
                                    return console.log(e)
                                })
                            })
                        } 
                    }
                } catch (err) {
                    slashError(interaction, err, true, 'SLASHAUTOREACTION_ADD_ERR')
                }
            } else if (subCommand == 'delete') {
                try {
                    let target = interaction.options.getString('target')
                    if (!db.has(`${interaction.guild.id}.ar.${target.toLowerCase()}`)) {
                        let errembed = new MessageEmbed()
                        .setDescription('<:celestialError:994174557642575872> `'+ target + '` is not a valid auto reaction!')
                        .setFooter('You can view all autoreactions in this server by using the `' + db.get(`${interaction.guild.id}.prefix`) + 'autoreaction view`')
                        .setColor('RED')

                        interactionDefer(interaction, true).then(() => {
                            return interaction.editReply({
                                embeds: [errembed]
                            }).catch(e => {
                                return console.log(e)
                            })
                        })
                    } else {
                        db.delete(`${interaction.guild.id}.ar.${target.toLowerCase()}`)
                                
                        let ogarr = db.get(`${interaction.guild.id}.arlist`)
                        ogarr.splice(db.get(`${interaction.guild.id}.arlist`).indexOf(target.toLowerCase()), 1)
       
                        db.set(`${interaction.guild.id}.arlist`, ogarr)
                        db.set(`${user.id}.cd.ar`, Date.now() + 15000)
    
                        let successEmbed = new MessageEmbed()
                        .setDescription('<:celestialTick:994174510402121818> Successfully deleted the `'+ target + '` auto reaction!')
                        .setColor('GREEN')

                        interactionDefer(interaction, false).then(() => {
                            return interaction.editReply({
                                embeds: [successEmbed]
                            }).catch(e => {
                                return console.log(e)
                            })
                        })
                    }
                } catch (err) {
                    slashError(interaction, err, true, 'SLASHAUTOREACTION_DELETE_ERR')
                }
            } else if (subCommand == 'info') {
                let target = interaction.options.getString('target')
                let info = db.get(`${interaction.guild.id}.ar.${target}`)

                if (!info) {
                    let embed = new MessageEmbed()
                    .setDescription(`<:celestialError:994174557642575872> There doesn't seem to be an autoreaction of which the trigger is ${ '`' + target + '`'}! You can however make it a valid autoreaction via ${ '`' + db.get(`${interaction.guild.id}.prefix`)}autoreaction add` + "`.")
                    .setColor('RED')
        
                    interactionDefer(interaction, true).then(() => {
                        interaction.editReply({
                            embeds: [embed]
                        }).catch(e => {
                            return console.log(e)
                        })
                    })
                } else {
                    let trigger = target
                    let reaction = info.reaction
                    let type = info.type
        
                    if (!type) {
                        db.set(`${interaction.guild.id}.ar.${trigger}.type`, 1)
                    }
        
                    type = db.get(`${interaction.guild.id}.ar.${trigger}.type`)
        
                    let footers = [
                        'You can get the full guide on using autoreactions at `' + db.get(`${interaction.guild.id}.prefix`) + 'help autoreaction`!',
                        'Check out `' + db.get(`${interaction.guild.id}.prefix`) + 'help autoreaction types` if you are not familiar with ' + client.user.username + "'s autoreaction type feature!",
                        'Autoreactions is quite difficult to fully understand therefore you can get further documentations on autoreaction subcommands via `' + db.get(`${interaction.guild.id}.prefix`) + 'help autoreaction <sub-command>`!'
                    ]
        
                    let footer = footers[Math.floor(Math.random() * footers.length)]
        
                    let embed = new MessageEmbed()
                    .addFields(
                        {
                            name: "**<:tehopeng:950389690115170315> Autoreaction Info**",
                            value: "\u200b"
                        },
                        {
                            name: "<:kannabeingkanna:950390490778460220> Trigger",
                            value: trigger,
                            inline: true
                        },
                        {
                            name: "<:sovabeingsova:950391661580652595> Reaction" ,
                            value: reaction,
                            inline: true
                        },
                        {
                            name: "<:cutehutao:950402587788738570>  Raw Reaction",
                            value: "`" + reaction + "`",
                            inline: true
                        },
                        {
                            name: "<:jett:950391180024234045> Type",
                            value: '`' + typeCheck(type) + '`',
                            inline: true
                        }
                    )
                    .setColor('GREEN')
                    .setAuthor(user.username, user.displayAvatarURL())
                    .setFooter(footer)

                    db.set(`${user.id}.cd.ar`, Date.now() + 20000)

                    interactionDefer(interaction, false).then(() => {
                        return interaction.editReply({
                            embeds: [embed]
                        }).catch(e => {
                            return console.log(e)
                        })
                    })
                }
            } else if (subCommand == 'edit') {
                try {
                    let trigger = interaction.options.getString('target')
                    let reaction = interaction.options.getString('reaction')
                    let type = interaction.options.getString('type')
    
                    if (!db.has(`${interaction.guild.id}.ar.${trigger.toLowerCase()}`)) {
                        let embed = new MessageEmbed()
                        .setDescription('<:celestialError:994174557642575872> `' + trigger + '` is not an existing autoreaction! You can make it an autoreaction via the `/autoreaction add` slash command or through the `' + db.get(`${interaction.guild.id}.prefix`) + 'autoreaction add` command.')
                        .setColor('RED')
    
                        return interactionDefer(interaction, true).then(() => {
                            return interaction.editReply({
                                embeds: [embed]
                            }).catch(e => {
                                return console.log(e)
                            })
                        })
                    }

                    if (type == 4 || type == 5) {
                        trigger = trigger.split(' ')
                        if (trigger.length > 1) {
                            return interactionDefer(interaction, true).then(() => {
                                return interaction.editReply("Autoreaction triggers for types `STARTS_WITH` and `ENDS_WITH` cannot include spaces!").catch(e => {
                                    return console.log(e)
                                })
                            })
                        }
                        trigger = trigger.join(' ');
                    }
    
                    let footers = [
                        'You can get the full guide on using autoreactions at `' + db.get(`${interaction.guild.id}.prefix`) + 'help autoreaction`!',
                        'Check out `' + db.get(`${interaction.guild.id}.prefix`) + 'help autoreaction types` if you are not familiar with ' + client.user.username + "'s autoreaction type feature!",
                        'Autoreactions is quite difficult to fully understand therefore you can get further documentations on autoreaction subcommands via `' + db.get(`${interaction.guild.id}.prefix`) + 'help autoreaction <sub-command>`!'
                    ]
    
                    let footer = footers[Math.floor(Math.random() * footers.length)]
                    if (db.has(`${interaction.guild.id}.ar.${trigger.toLowerCase()}`)) {
                        if (!type && !reaction) {
                            let embed = new MessageEmbed()
                            .setDescription('<:celestialError:994174557642575872> No reaction or type has been changed for the `' + trigger + '` autoreaction.')
                            .setColor('RED')

                            return interactionDefer(interaction, true).then(() => {
                                return interaction.editReply({
                                    embeds: [embed]
                                }).catch(e => {
                                    return console.log(e)
                                })
                            })
                        }

                        console.log(reaction)
                        if ((reaction && reaction.length < 1000) || (trigger && trigger.length < 100)) { 
                            if (type) {
                                db.set(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.type`, type)
                            }
    
                            if (reaction) {
                                db.set(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.reaction`, `${reaction}`)
                            }
                            
                            let embed = new MessageEmbed()
                            .setTitle('Successfully updated an existing autoreaction!')
                            .addFields(
                                {
                                    name: "**<:tehopeng:950389690115170315> Autoreaction Info**",
                                    value: "\u200b"
                                },
                                {
                                    name: "<:kannabeingkanna:950390490778460220> Trigger",
                                    value: `${trigger}`,
                                    inline: true
                                },
                                {
                                    name: "<:sovabeingsova:950391661580652595> Reaction" ,
                                    value: `${db.get(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.reaction`)}`,
                                    inline: true
                                },
                                {
                                    name: "<:cutehutao:950402587788738570>  Raw Reaction",
                                    value: "`" + db.get(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.reaction`) + "`",
                                    inline: true
                                },
                                {
                                    name: "<:jett:950391180024234045> Type",
                                    value: '`' + typeCheck(db.get(`${interaction.guild.id}.ar.${trigger.toLowerCase()}.type`)) + '`',
                                    inline: true
                                }
                            )
                            .setFooter(footer)
                            .setColor('GREEN')
                            .setAuthor(user.username, user.displayAvatarURL())
                            
                            db.set(`${user.id}.cd.ar`, Date.now() + 20000)
    
                            interactionDefer(interaction, false).then(() => {
                                interaction.editReply({
                                    embeds: [embed]
                                }).catch(e => {
                                    return console.log(e)
                                })
                            })
                        } else {
                            if (reaction && reaction.length > 1000) {
                                interactionDefer(interaction, true).then(() => {
                                    let erremebed = new MessageEmbed()
                                    .setDescription('<:celestialError:994174557642575872> Reaction length cannot exceed `1,000` characters!')
                                    .setColor('RED')
                
                                    return interaction.editReply({
                                        embeds: [erremebed]
                                    }).catch(e => {
                                        return console.log(e)
                                    })
                                })
                            } else if (reaction && reaction.length < 1) {
                                interactionDefer(interaction, true).then(() => {
                                    let erremebed = new MessageEmbed()
                                    .setDescription('<:celestialError:994174557642575872> Reaction length cannot be less than `1` character!')
                                    .setColor('RED')
                
                                    return interaction.editReply({
                                        embeds: [erremebed]
                                    }).catch(e => {
                                        return console.log(e)
                                    })
                                })
                            } else if (trigger && trigger.length > 100) {
                                interactionDefer(interaction, true).then(() => {
                                    let erremebed = new MessageEmbed()
                                    .setDescription('<:celestialError:994174557642575872> Trigger length cannot exceed `100` characters!')
                                    .setColor('RED')
                
                                    return interaction.editReply({
                                        embeds: [erremebed]
                                    }).catch(e => {
                                        return console.log(e)
                                    })
                                })
                            } else {
                                console.log('[\x1b[33mWARNING\x1b[37m] An error has occured while replying to invalid reaction & trigger lengths!')
    
                                slashError(interaction, err, true, 'AUTOREACTION_INVALID_RTLENGTH_ERR')
                            }
                        }
                    } else {
                        interactionDefer(interaction, true).then(() => {
                            let erremebed = new MessageEmbed()
                            .setDescription('<:celestialError:994174557642575872>' + ` ${'`' + trigger.toLowerCase() + '` is not an existing autoreaction. You can mae it an autoreaction via the `/autoreaction add` slash command or the `' + db.get(`${interaction.guild.id}.prefix`) + 'autoreaction add` command.'}`)
                            .setColor('RED')
        
                            return interaction.editReply({
                                embeds: [erremebed]
                            }).catch(e => {
                                return console.log(e)
                            })
                        })
                    }
                } catch (err) {
                    slashError(interaction, err, true, 'SLASHAUTOREACTION_EDIT_ERR')
                }
            } else if (subCommand == 'view') {
                try {

                    if (!db.has(`${interaction.guild.id}.arlist`)) {
                        return interactionDefer(interaction, true).then(() => {
                            return interaction.editReply("There doesn't seem to be any auto reactions in this server :c").catch(e => {
                                return console.log(e)
                            })
                        })
                    }

                    let embedsplice = []
                    let ogarr = db.get(`${interaction.guild.id}.arlist`) 
                    let arrlength = Math.ceil(ogarr.length / 10)
                    for (let i = 0; i < arrlength; i++) {
                        let embedpart = ogarr.splice(0, 10)
                        embedsplice.push(embedpart)
                    }
                    let embedlist = []
        
                    for (let i = 0; i < embedsplice.length; i++) {
                        let item = embedsplice[i]
                        let msg = ''
                        let embed 
        
                        for (let j = 0; j < item.length; j++) {
                            msg = msg + '\n` - ` ' + item[j]
                        }
        
                        embed = new MessageEmbed()
                        .setTitle(`${interaction.guild.name}'s autoreactions (${db.get(`${interaction.guild.id}.arlist`).length})`)
                        .setDescription(msg)
                        .setFooter(`Page ${i + 1}/${embedsplice.length} | You can get the full guide on using autoreactions via ${ '`' + db.get(`${interaction.guild.id}.prefix`)}help autoreaction` + '`' + ` !`)
                        .setColor('#2e3036')
        
                        embedlist.push(embed)
                    }

                    const row = new MessageActionRow()
                    .addComponents(
                        firstpage = new MessageButton()
                        .setCustomId('firstpageslasharv')
                        .setEmoji("<:pleftmax:947712135096565780>")
                        .setDisabled(true)
                        .setStyle('PRIMARY'),
        
                        previouspage = new MessageButton()
                        .setCustomId('previouspageslasharv')
                        .setEmoji('<:pleft:947713254627635230>')
                        .setDisabled(true)
                        .setStyle('PRIMARY'),
        
                        nextpage = new MessageButton()
                        .setCustomId('nextpageslasharv')
                        .setEmoji("<:pright:947713128303587338>")
                        .setDisabled(false)
                        .setStyle('PRIMARY'),
        
                        lastpage = new MessageButton()
                        .setCustomId('lastpageslasharv')
                        .setEmoji('<:prightmax:947712150766510150>')
                        .setDisabled(false)
                        .setStyle('PRIMARY'),
        
                        pagejump = new MessageButton()
                        .setCustomId('pagejumpslasharv')
                        .setEmoji('<:pqmark:948985074924277791>')
                        .setDisabled(true)
                        .setStyle('PRIMARY')
                    )

                    const pageJumpCheck = new Map();
                    pageJumpCheck.set('pageJumpSLASH_ARV', false)

                    let currentpage = 0
                    if (embedlist.length >= 5) {
                        row.components[4].setDisabled(false)
                    }
        
                    if (embedlist.length == 1) {
                        interactionDefer(interaction, false).then(() => {
                            interaction.editReply({
                                embeds: [embedlist[currentpage]]
                            })
                        })
                    } else {
                        interactionDefer(interaction, false).then(() => {
                            interaction.editReply({
                                embeds: [embedlist[currentpage]],
                                components: [row]
                            })
                        })
                    }


                    const filter = i => i.user.id === interaction.user.id

                    const collector = interaction.channel.createMessageComponentCollector(
                        {
                            filter,
                            time: 30000
                        }
                    )

                    collector.on('collect', async i => {
                        try {
                            const id = i.customId
                            if (id === 'firstpageslasharv') {
                                currentpage = 0
                                row.components[0].setDisabled(true)
                                row.components[1].setDisabled(true)
                                row.components[2].setDisabled(false)
                                row.components[3].setDisabled(false)
        
                                interaction.editReply({
                                    embeds: [embedlist[currentpage]],
                                    components: [row]
                                }).catch(e => {
                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                })
                            } else if (id === 'previouspageslasharv') {
                                currentpage = currentpage - 1
                                if (currentpage <= 0) {
                                    row.components[0].setDisabled(true)
                                    row.components[1].setDisabled(true)
                                    row.components[2].setDisabled(false)
                                    row.components[3].setDisabled(false)
            
                                    interaction.editReply({
                                        embeds: [embedlist[currentpage]],
                                        components: [row]
                                    }).catch(e => {
                                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                    })
                                } else {
                                    row.components[0].setDisabled(false)
                                    row.components[1].setDisabled(false)
                                    row.components[2].setDisabled(false)
                                    row.components[3].setDisabled(false)
            
                                    interaction.editReply({
                                        embeds: [embedlist[currentpage]],
                                        components: [row]
                                    }).catch(e => {
                                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                    })
                                }
                            } else if (id === 'nextpageslasharv') {
                                currentpage = currentpage + 1
        
                                if (currentpage >= embedlist.length - 1) {
                                    row.components[0].setDisabled(false)
                                    row.components[1].setDisabled(false)
                                    row.components[2].setDisabled(true)
                                    row.components[3].setDisabled(true)
            
                                    interaction.editReply({
                                        embeds: [embedlist[currentpage]],
                                        components: [row]
                                    }).catch(e => {
                                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                    })
                                } else {
                                    row.components[0].setDisabled(false)
                                    row.components[1].setDisabled(false)
                                    row.components[2].setDisabled(false)
                                    row.components[3].setDisabled(false)
            
                                    interaction.editReply({
                                        embeds: [embedlist[currentpage]],
                                        components: [row]
                                    }).catch(e => {
                                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                    })
                                }
                            } else if (id === 'lastpageslasharv') {
                                currentpage = embedlist.length - 1
        
                                row.components[0].setDisabled(false)
                                row.components[1].setDisabled(false)
                                row.components[2].setDisabled(true)
                                row.components[3].setDisabled(true)
        
                                interaction.editReply({
                                    embeds: [embedlist[currentpage]],
                                    components: [row]
                                }).catch(e => {
                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                })
                            } else if (id === 'pagejumpslasharv') {
                                if (pageJumpCheck.get('pageJumpSLASH_ARV')) {
                                    return;
                                }
        
                                pageJumpCheck.set('pageJumpSLASH_ARV', true)
                                let pagejumpmsg = await interaction.channel.send('Please provide a valid page to jump to.')
                                const msgfilter = m => m.author.id === interaction.user.id
        
                                const msgcollector = interaction.channel.createMessageCollector(
                                    {
                                        msgfilter, 
                                        max: 1,
                                        time: 10000
                                    }
                                )
        
                                msgcollector.on('collect', async m => {
                                    try {
                                        let content = m.content
                                        if (isNaN(content) || parseInt(content) < 1 || parseInt(content) > embedlist.length) {
                                            let errmsg = await m.reply(`${'`' + content + '` is not a valid page number.'}`)
        
                                            autoDelete([errmsg, pagejumpmsg, m], 5000)
                                        } else {
                                            autoDelete([pagejumpmsg, m])
                                            currentpage = content - 1
        
                                            if (currentpage >= embedlist.length - 1) {
                                                row.components[0].setDisabled(false)
                                                row.components[1].setDisabled(false)
                                                row.components[2].setDisabled(true)
                                                row.components[3].setDisabled(true)
        
                                                interaction.editReply({
                                                    embeds: [embedlist[currentpage]],
                                                    components: [row]
                                                }).catch(e => {
                                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                                })
                                            } else if (currentpage == 0) {
                                                row.components[0].setDisabled(true)
                                                row.components[1].setDisabled(true)
                                                row.components[2].setDisabled(false)
                                                row.components[3].setDisabled(false)
        
                                                interaction.editReply({
                                                    embeds: [embedlist[currentpage]],
                                                    components: [row]
                                                }).catch(e => {
                                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                                })
                                            } else {
                                                if (row.components[0].disabled && row.components[1].disabled && row.components[2].disabled && row.components[3].disabled) {
                                                    row.components[0].setDisabled(true)
                                                    row.components[1].setDisabled(true)
                                                    row.components[2].setDisabled(true)
                                                    row.components[3].setDisabled(true)
                                                } else {
                                                    row.components[0].setDisabled(false)
                                                    row.components[1].setDisabled(false)
                                                    row.components[2].setDisabled(false)
                                                    row.components[3].setDisabled(false)
                                                }
                        
                                                interaction.editReply({
                                                    embeds: [embedlist[currentpage]],
                                                    components: [row]
                                                }).catch(e => {
                                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                                })
                                            }
                                        }
                                    } catch (err) {
                                        slashError(interaction, e, true, 'ARVIEW_PAGINATION_PAGEJUMP_ERR')
                                    }
                                })
        
                                msgcollector.on('end', collected => {
                                    if (collected.size < 1) {
                                        autoDelete(pagejumpmsg)
                                    }
        
                                    pageJumpCheck.set('pageJumpSLASH_ARV', false)
                                })
                            }
                        } catch (err) {
                            slashError(interaction, e, true, 'ARVIEW_PAGINATION_ERR')
                        }
                    })

                    collector.on('end', collected => {
                        if (embedlist.length == 1) {
                            return;
                        }
        
                        row.components[0].setDisabled(true)
                        row.components[1].setDisabled(true)
                        row.components[2].setDisabled(true)
                        row.components[3].setDisabled(true)
                        row.components[4].setDisabled(true)
        
                        interaction.editReply({
                            components: [row]
                        }).catch(e => {
                            return console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e);
                        }).then(() => {
                            setTimeout(() => {
                                try {
                                    interaction.editReply({
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
                } catch (e) {
                    slashError(interaction, e, true, 'SLASHAUTOREACTION_VIEW_ERR')
                }
            }
        } catch (err) {
            slashError(interaction, err, true, 'SLASHAUTOREACTION_GENERAL_ERR')
        }
    }
}