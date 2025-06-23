const { time } = require("console");
const { MessageEmbed, MessageActionRow, MessageButton} = require("discord.js");
const { readFile } = require("fs");
const db = require('quick.db');
const components = require('../../components');
const config = require('../../config');
const { error, convertMs, autoDelete, spaceGenerator, typeCheck } = require('../../functions');
exports.execute = async (client, message, args) => {

    const user = message.author
    let arlimit = 50
    if (!message.member.permissions.has('MANAGE_GUILD')) {
        return;
    } else if (!args[0]) {
        return message.reply(`You can get the full guide on using auto reactions by running ${'`' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!'}`)
    } else if (db.get(`${user.id}.cd.ar`) - Date.now() > 0) {
        return message.reply('Ayo you recently used this command... Wait for ' + convertMs(db.get(`${user.id}.cd.ar`) - Date.now(), true) + ' before using the command again.').then(msg => {
            setTimeout(() => {
                msg.delete().catch(err => {
                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                });
            }, 7500)
        })
    } else if (args[0].toLowerCase() == 'view' || args[0].toLowerCase() == 'list') {
        try {
            db.set(`${user.id}.cd.ar`, Date.now() + 40000)
        } catch (err) {
            console.log(err)
        }
        try {
            if (!db.has(`${message.guild.id}.arlist`)) {
                return message.reply("There doesn't seem to be any auto reactions in this server :c");
            }

            let embedsplice = []
            let ogarr = db.get(`${message.guild.id}.arlist`) 
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
                .setTitle(`${message.guild.name}'s autoreactions (${db.get(`${message.guild.id}.arlist`).length})`)
                .setDescription(msg)
                .setFooter(`Page ${i + 1}/${embedsplice.length} | You can get the full guide on using autoreactions via ${ '`' + db.get(`${message.guild.id}.prefix`)}help autoreaction` + '`' + ` !`)
                .setColor('#2e3036')

                embedlist.push(embed)
            }

            const row = new MessageActionRow()
            .addComponents(
                firstpage = new MessageButton()
                .setCustomId('firstpagearv')
                .setEmoji("<:pleftmax:947712135096565780>")
                .setDisabled(true)
                .setStyle('PRIMARY'),

                previouspage = new MessageButton()
                .setCustomId('previouspagearv')
                .setEmoji('<:pleft:947713254627635230>')
                .setDisabled(true)
                .setStyle('PRIMARY'),

                nextpage = new MessageButton()
                .setCustomId('nextpagearv')
                .setEmoji("<:pright:947713128303587338>")
                .setDisabled(false)
                .setStyle('PRIMARY'),

                lastpage = new MessageButton()
                .setCustomId('lastpagearv')
                .setEmoji('<:prightmax:947712150766510150>')
                .setDisabled(false)
                .setStyle('PRIMARY'),

                pagejump = new MessageButton()
                .setCustomId('pagejumparv')
                .setEmoji('<:pqmark:948985074924277791>')
                .setDisabled(true)
                .setStyle('PRIMARY')
            )
            const pageJumpCheck = new Map();
            pageJumpCheck.set('pageJumpARV', false)

            let currentpage = 0

            let botmsg

            if (embedlist.length >= 5) {
                row.components[4].setDisabled(false)
            }

            if (embedlist.length == 1) {
                botmsg = await message.reply({
                    embeds: [embedlist[currentpage]]
                })
            } else {
                botmsg = await message.reply({
                    embeds: [embedlist[currentpage]],
                    components: [row]
                })

            }

            const filter = i => i.user.id === user.id

            const collector = message.channel.createMessageComponentCollector({
                filter,
                time: 15000
            })

            //Ends interaction if no buttons are pressed in 15 seconds
            let timeoutLimit = Date.now() + 15000

            if (timeoutLimit - Date.now() < 0) {
                collector.stop();
                if (embedlist.length == 1) {
                    return;
                };
            
                row.components[0].setDisabled(true)
                row.components[1].setDisabled(true)
                row.components[2].setDisabled(true)
                row.components[3].setDisabled(true)
                row.components[4].setDisabled(true)

                botmsg.edit({
                    components: [row]
                }).catch(e => {
                    return console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e);
                }).then(() => {
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
            }

            collector.on('collect', async interaction => {
                try {
                    timeoutLimit = Date.now() + 15000
                    
                    const id = interaction.customId
                    if (id === 'firstpagearv') {
                        currentpage = 0
                        row.components[0].setDisabled(true)
                        row.components[1].setDisabled(true)
                        row.components[2].setDisabled(false)
                        row.components[3].setDisabled(false)

                        botmsg.edit({
                            embeds: [embedlist[currentpage]],
                            components: [row]
                        }).catch(e => {
                            console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                        })
                    } else if (id === 'previouspagearv') {
                        currentpage = currentpage - 1
                        if (currentpage <= 0) {
                            row.components[0].setDisabled(true)
                            row.components[1].setDisabled(true)
                            row.components[2].setDisabled(false)
                            row.components[3].setDisabled(false)
    
                            botmsg.edit({
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
    
                            botmsg.edit({
                                embeds: [embedlist[currentpage]],
                                components: [row]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        }
                    } else if (id === 'nextpagearv') {
                        currentpage = currentpage + 1

                        if (currentpage >= embedlist.length - 1) {
                            row.components[0].setDisabled(false)
                            row.components[1].setDisabled(false)
                            row.components[2].setDisabled(true)
                            row.components[3].setDisabled(true)
    
                            botmsg.edit({
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
    
                            botmsg.edit({
                                embeds: [embedlist[currentpage]],
                                components: [row]
                            }).catch(e => {
                                console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                            })
                        }
                    } else if (id === 'lastpagearv') {
                        currentpage = embedlist.length - 1

                        row.components[0].setDisabled(false)
                        row.components[1].setDisabled(false)
                        row.components[2].setDisabled(true)
                        row.components[3].setDisabled(true)

                        botmsg.edit({
                            embeds: [embedlist[currentpage]],
                            components: [row]
                        }).catch(e => {
                            console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                        })
                    } else if (id === 'pagejumparv') {
                        if (pageJumpCheck.get('pageJumpARV')) {
                            return;
                        }

                        pageJumpCheck.set('pageJumpARV', true)
                        let pagejumpmsg = await message.channel.send('Please provide a valid page to jump to.')
                        const msgfilter = m => m.author.id === user.id

                        const msgcollector = message.channel.createMessageCollector(
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

                                        botmsg.edit({
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

                                        botmsg.edit({
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
                
                                        botmsg.edit({
                                            embeds: [embedlist[currentpage]],
                                            components: [row]
                                        }).catch(e => {
                                            console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                        })
                                    }
                                }
                            } catch (err) {
                                error(message, err, 'ARVIEW_PAGINATION_PAGEJUMP_ERR')
                            }
                        })

                        msgcollector.on('end', collected => {
                            if (collected.size < 1) {
                                autoDelete(pagejumpmsg)
                            }

                            pageJumpCheck.set('pageJumpARV', false)
                        })
                    }
                } catch (err) {
                    error(message, err, 'ARVIEW_PAGINATION_ERR')
                }
            })

        } catch (err) {
            console.log(err)

            error(message, 'AUTOREACTION_VIEW_ERR')
        }
    } else if (args[0].toLowerCase() == 'add' || args[0].toLowerCase() == '+') {
        try {
            if (db.has(`${message.guild.id}.arlist`) && db.get(`${message.guild.id}.arlist`).length > arlimit) {
                return message.reply(`**${message.guild.name}** has hit it's limit of ${'`' + 50 + '`'} auto reaction! Please delete a previous auto reaction before adding another.`)
            } else if (!args[1]) {
                let errembed = new MessageEmbed() 
                .setTitle('Missing required arguments!')
                .setDescription("```\n"+ db.get(`${message.guild.id}.prefix`) +"autoreaction add <trigger> || <reaction>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "                 ^^^^^^^^^ ^^ ^^^^^^^^^^\n```\n\n` - ` `<>` are required arguments\n` - ` `[]` are optional arguments\n` - ` `||` is a required object to seperate the trigger with the reaction\n` - ` Please keep in mind that the spaces that are between `<trigger>`, `||` and `reaction` are all required.")
                .setFooter(`You can get the full guide on using auto reactions by running ${'`' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!'}`)
                .setColor('#2e3036')
                
                return message.reply({
                    embeds: [errembed]
                })
            } else if (!args[2]) {
                let errembed = new MessageEmbed() 
                .setTitle('Missing required arguments!')
                .setDescription("```\n"+ db.get(`${message.guild.id}.prefix`) +"autoreaction add <trigger> || <reaction>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "                           ^^ ^^^^^^^^^^\n```\n\n` - ` `<>` are required arguments\n` - ` `[]` are optional arguments\n` - ` `||` is a required object to seperate the trigger with the reaction\n` - ` Please keep in mind that the spaces that are between `<trigger>`, `||` and `reaction` are all required.")
                .setFooter(`You can get the full guide on using auto reactions by running ${'`' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!'}`)
                .setColor('#2e3036')
                
                return message.reply({
                    embeds: [errembed]
                })
            } else if (!args.join(' ').includes('||')) {
                let errembed = new MessageEmbed()
                .setTitle('Missing required arguments!')
                .setDescription("```\n"+ db.get(`${message.guild.id}.prefix`)+"autoreaction add <trigger> || <reaction>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "                           ^^ \n```\n\n` - ` `<>` are required arguments\n` - ` `[]` are optional arguments\n` - ` `||` is a required object to seperate the trigger with the reaction\n` - ` Please keep in mind that the spaces that are between `<trigger>`, `||` and `reaction` are all required.")
                .setFooter(`You can get the full guide on using auto reactions by running ${'`' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!'}`)
                .setColor('#2e3036')
    
                return message.reply({
                    embeds: [errembed]
                })
            } else if (args[1] == '||') {
                let errembed = new MessageEmbed()
                .setTitle('Missing required arguments!')
                .setDescription("```\n"+ db.get(`${message.guild.id}.prefix`)+"autoreaction add <trigger> || <reaction>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "                 ^^^^^^^^^\n```\n\n` - ` `<>` are required arguments\n` - ` `[]` are optional arguments\n` - ` `||` is a required object to seperate the trigger with the reaction\n` - ` Please keep in mind that the spaces that are between `<trigger>`, `||` and `reaction` are all required.")
                .setFooter(`You can get the full guide on using auto reactions by running ${'`' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!'}`)
                .setColor('#2e3036')
                
                return message.reply({
                    embeds: [errembed]
                })
            } else if (!args.join(' ').split('||')[1]) {
                let errembed = new MessageEmbed()
                .setTitle('Missing required arguments!')
                .setDescription("```\n"+ db.get(`${message.guild.id}.prefix`)+"autoreaction add <trigger> || <reaction>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "                              ^^^^^^^^^^\n```\n\n` - ` `<>` are required arguments\n` - ` `[]` are optional arguments\n` - ` `||` is a required object to seperate the trigger with the reaction\n` - ` Please keep in mind that the spaces that are between `<trigger>`, `||` and `reaction` are all required.")
                .setFooter(`You can get the full guide on using auto reactions by running ${'`' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!'}`)
                .setColor('#2e3036')
                
                return message.reply({
                    embeds: [errembed]
                })
            } else {
                args.shift();
                let base = args
                let trigger = base.splice(0, base.indexOf('||'))

                let reaction = base
                reaction.shift();
                reaction = reaction
                let type 

                if (reaction.includes('?t') || reaction.includes('?type')) {
                    let indexOft = reaction.indexOf('?t')
                    let indexOftype = reaction.indexOf('?type')


                    if (reaction.includes('?t') && !isNaN(indexOft)) {
                        type = reaction.splice(indexOft, 2)
                        type = type.pop();
                    } else if (reaction.includes('?type') && isNaN(indexOftype)) {
                        type = reaction.splice(indexOftype, 2)
                        type = type.pop();
                    }

                    if (!isNaN(type)) {
                        return message.reply(`${'`' + type + '`'} is not a valid type of autoreaction! Please refer to ${ '`' + db.get(`${message.guild.id}.prefix`)}help autoreaction types` + "` for more info.");
                    } else if (typeCheck(type) == 'invalid' || (typeCheck(type) < 1 && typeCheck(type) > 7)) {
                        return message.reply(`${'`' + type + '`'} is not a valid type of autoreaction! Please refer to ${ '`' + db.get(`${message.guild.id}.prefix`)}help autoreaction types` + "` for more info.");
                    } else {
                        type = typeCheck(type) 
                    }
                }

                while (trigger[trigger.length - 1] == '' || !trigger[trigger.length - 1]) {
                    trigger.pop();
                    trigger = trigger
                }

                if (type == 4 || type == 5) {
                    if (trigger.length > 1) {
                        return message.reply("Triggers for type `STARTS_WITH` and type `ENDS_WITH`'s autoreactions cannot include spaces!");
                    }
                }

                trigger = trigger.join(' ');
                type = parseInt(type)

                let footers = [
                    'You can get the full guide on using autoreactions at `' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!',
                    'Check out `' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction types` if you are not familiar with ' + client.user.username + "'s autoreaction type feature!",
                    'Autoreactions is quite difficult to fully understand therefore you can get further documentations on autoreaction subcommands via `' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction <sub-command>`!'
                ]

                let footer = footers[Math.floor(Math.random() * footers.length)]
                if (!db.has(`${message.guild.id}.ar.${trigger.toLowerCase()}`)) {
                    while (reaction[0] == '') {
                        reaction.shift();
                        reaction = reaction
                    }

                    reaction = reaction.join(' ');

                    if (reaction.length >= 1 && reaction.length <= 1000 && trigger.length <= 100) { 
                        if (!type) {
                            type = 1
                        }

                        db.set(`${message.guild.id}.ar.${trigger.toLowerCase()}.reaction`, `${reaction}`)
                        db.set(`${message.guild.id}.ar.${trigger.toLowerCase()}.type`, type)
                        db.push(`${message.guild.id}.arlist`, `${trigger.toLowerCase()}`)
                        
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
                                value: `${db.get(`${message.guild.id}.ar.${trigger.toLowerCase()}.reaction`)}`,
                                inline: true
                            },
                            {
                                name: "<:cutehutao:950402587788738570>  Raw Reaction",
                                value: "`" + db.get(`${message.guild.id}.ar.${trigger.toLowerCase()}.reaction`) + "`",
                                inline: true
                            },
                            {
                                name: "<:jett:950391180024234045> Type",
                                value: '`' + typeCheck(db.get(`${message.guild.id}.ar.${trigger.toLowerCase()}.type`)) + '`',
                                inline: true
                            }
                        )
                        .setFooter(footer)
                        .setColor('GREEN')
                        .setAuthor(user.username, user.displayAvatarURL())
                        
                        db.set(`${user.id}.cd.ar`, Date.now() + 20000)

                        return message.reply({
                            embeds: [embed]
                        })
                    } else {
                        if (reaction.length > 1000) {
                            let embed = new MessageEmbed()
                            .setDescription('<:celestialError:994174557642575872> Reaction length cannot exceed `1,000` characters!')
                            .setColor('RED')

                            return message.reply({
                                embeds: [embed]
                            });
                        } else if (reaction.length < 1) {
                            let embed = new MessageEmbed()
                            .setDescription('<:celestialError:994174557642575872> Reaction length cannot be less than `1` character!')
                            .setColor('RED')

                            return message.reply({
                                embeds: [embed]
                            });                            
                        } else if (trigger.length > 100) {
                            let embed = new MessageEmbed()
                            .setDescription('<:celestialError:994174557642575872> Trigger length cannot exceed `100` characters!')
                            .setColor('RED')

                            return message.reply({
                                embeds: [embed]
                            });
                        } else {
                            console.log('[\x1b[33mWARNING\x1b[37m] An error has occured while replying to invalid reaction & trigger lengths!')
    
                            error(message, 'AUTOREACTION_INVALID_RTLENGTH_ERR')
                        }
                    }
                } else if (db.has(`${message.guild.id}.ar.${trigger.toLowerCase()}`)) {
                    if (!reaction || reaction.length < 1) {
                        reaction =  db.get(`${message.guild.id}.ar.${trigger.toLowerCase()}.reaction`).split(' ');
                    }

                    while (reaction[0] == '') {
                        reaction.shift();
                        reaction = reaction
                    }

                    
                    reaction = reaction.join(' ');

                    if (reaction.length <= 1000 && trigger.length <= 100) {
                        db.set(`${message.guild.id}.ar.${trigger.toLowerCase()}.reaction`, `${reaction}`)

                        let usertype = db.get(`${message.guild.id}.ar.${trigger.toLowerCase()}.type`)

                        if (!usertype) {
                            usertype = 1
                        }

                        if (!type) {
                            type = usertype
                        }

                        db.set(`${message.guild.id}.ar.${trigger.toLowerCase()}.type`, type)

                        let embed = new MessageEmbed()
                        .setTitle('Successfully updated an existing autoreaction!')
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
                                value: db.get(`${message.guild.id}.ar.${trigger.toLowerCase()}.reaction`),
                                inline: true
                            },
                            {
                                name: "<:cutehutao:950402587788738570>  Raw Reaction",
                                value: "`" + db.get(`${message.guild.id}.ar.${trigger.toLowerCase()}.reaction`) + "`",
                                inline: true
                            },
                            {
                                name: "<:jett:950391180024234045> Type",
                                value: '`' + typeCheck(db.get(`${message.guild.id}.ar.${trigger.toLowerCase()}.type`)) + '`',
                                inline: true
                            }
                        )
                        .setColor('GREEN')
                        .setAuthor(user.username, user.displayAvatarURL())
                        .setFooter(footer)
                        db.set(`${user.id}.cd.ar`, Date.now() + 20000)

                        return message.reply({
                            embeds: [embed]
                        })
                    } else {
                        if (reaction.length > 1000) {
                            let embed = new MessageEmbed()
                            .setDescription("<:celestialError:994174557642575872> Your previous autoreaction's reaction length has exceed `1,000` characters! Please include a shorter autoreaction reaction to proceed with this edit.")
                            .setColor('RED')

                            return message.reply({
                                embeds: [embed]
                            });
                        } else if (reaction.length < 1) {
                            if (reaction.length > 1000) {
                                let embed = new MessageEmbed()
                                .setDescription("<:celestialError:994174557642575872> Your previous autoreaction's trigger length has exceed `100` characters! Please delete the previous autoreaction to proceed with this edit.")
                                .setColor('RED')
    
                                return message.reply({
                                    embeds: [embed]
                                });
                            }
                        } else {
                            console.log('[\x1b[33mWARNING\x1b[37m] An error has occured while replying to invalid reaction & trigger lengths!')
    
                            error(message, 'AUTOREACTION_INVALID_RTLENGTH_ERR')
                        }
                    }
                } 
            }
        } catch (err) {
            console.log(err)

            error(message, 'AUTOREACTION_ADD_ERR')
        }
    } else if (args[0].toLowerCase() == 'remove' || args[0].toLowerCase() == '-' || args[0].toLowerCase() == 'delete') {
        try {
            let target = args.splice(1).join(' ')

            if (!target) {
                let errembed = new MessageEmbed()
                .setTitle('Missing required arguments!')
                .setDescription("```\n"+ db.get(`${message.guild.id}.prefix`) +"autoreaction remove <target>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "                    ^^^^^^^^\n```\n\n` - ` `<>` are required arguments\n` - ` `[]` are optional arguments")
                .setFooter(`You can get the full guide on using auto reactions by running ${'`' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!'}`)
                .setColor('#2e3036')
                
                return message.reply({
                    embeds: [errembed]
                })
            }
            if (!db.has(`${message.guild.id}.ar.${target.toLowerCase()}`)) {
                let errembed = new MessageEmbed()
                .setDescription('<:celestialError:994174557642575872> `'+ target + '` is not a valid auto reaction!')
                .setFooter('You can view all autoreactions in this server by using the `' + db.get(`${message.guild.id}.prefix`) + 'autoreaction view`')
                .setColor('RED')

                return message.reply({
                    embeds: [errembed]
                })
            } else {
                db.delete(`${message.guild.id}.ar.${target.toLowerCase()}`)

                let ogarr = db.get(`${message.guild.id}.arlist`)

                ogarr.splice(db.get(`${message.guild.id}.arlist`).indexOf(target.toLowerCase()), 1)

                db.set(`${message.guild.id}.arlist`, ogarr)
                db.set(`${user.id}.cd.ar`, Date.now() + 15000)

                let successEmbed = new MessageEmbed()
                .setDescription('<:celestialTick:994174510402121818> Successfully deleted the `'+ target + '` auto reaction!')
                .setColor('GREEN')
                
                return message.reply({
                    embeds: [successEmbed]
                })
            }
        } catch (err) {
            console.log(err)

            error(message, 'AUTOREACTION_DELETE_ERR')
        }
    } else if (args[0].toLowerCase() == 'info' || args[0].toLowerCase() == 'information') {
        let target = args.shift();
        target = args.join(" ")

        if (target.length < 1 || target.length > 100) {
            let embed = new MessageEmbed()
            .setDescription(`<:celestialError:994174557642575872> ${target} is not a valid autoreaction. Please refer to ${db.get(`${message.guild.id}.prefix`)}autoreaction view` + "` to see all available autoreactions in this server")
            .setColor('RED')

            return message.reply({
                embeds: [embed]
            })
        }

        let info = db.get(`${message.guild.id}.ar.${target}`)
        if (!info) {
            let embed = new MessageEmbed()
            .setDescription(`<:celestialError:994174557642575872> There doesn't seem to be an autoreaction of which the trigger is ${ '`' + target + '`'}! You can however make it a valid autoreaction via ${ '`' + db.get(`${message.guild.id}.prefix`)}autoreaction add` + "`.")
            .setColor('RED')

            return message.reply({
                embeds: [embed]
            })
        } else {
            let trigger = target
            let reaction = info.reaction
            let type = info.type

            if (!type) {
                db.set(`${message.guild.id}.ar.${trigger}.type`, 1)
            }

            type = db.get(`${message.guild.id}.ar.${trigger}.type`)

            let footers = [
                'You can get the full guide on using autoreactions at `' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!',
                'Check out `' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction types` if you are not familiar with ' + client.user.username + "'s autoreaction type feature!",
                'Autoreactions is quite difficult to fully understand therefore you can get further documentations on autoreaction subcommands via `' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction <sub-command>`!'
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

            return message.reply({
                embeds: [embed]
            })
        }
    } else {
        return message.reply(`You can get the full guide on using auto reactions by running ${'`' + db.get(`${message.guild.id}.prefix`) + 'help autoreaction`!'}`)
    }
}

exports.data = {
    name: "autoreaction",
    aliases: ["ar", "react", "autor", "autoreact"],
    usage: `autoreact <action> <reaction> || <response>`
}