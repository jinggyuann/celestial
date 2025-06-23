const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const config = require('../../config');
const { error, spaceGenerator }  = require('../../functions');
exports.execute = async (client, message, args) => {
    const user = message.author

    try {
        if (!message.member.permissions.has('MANAGE_GUILD') && !user.id.includes(config.dev)) {
            return;
        } else if (!args[0]) {
            let missingarguments = new MessageEmbed()
            .setTitle('Missing required arguments!')
            .setDescription("```\n"+ db.get(`${message.guild.id}.prefix`) +"settings <command>\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "         ^^^^^^^^^\n```\n\n` - ` `<>` are required arguments")
            .setFooter(`You can get the full guide on using auto reactions by running ${'`' + db.get(`${message.guild.id}.prefix`) + 'help settings`!'}`)
            .setColor('#2e3036')
            
            return message.reply({
                embeds: [missingarguments]
            })
        } else {
            let command = args[0].toLowerCase()

            if (command == 'afk' || command == 'awayfromkeyboard') { //AFK Command
                try {
                    const row1 = new MessageActionRow()
                    .addComponents(
                        addBlacklistRoleAFK = new MessageButton()
                        .setCustomId('addBlacklistedRoleAFK')
                        .setStyle('PRIMARY')
                        .setLabel('Add Blacklisted Role'),
        
                        removeBlacklistRoleAFK = new MessageButton()
                        .setCustomId('removeBlacklistedRoleAFK')
                        .setStyle('PRIMARY')
                        .setLabel('Remove Blacklisted Role'),
                    )
        
                    const row2 = new MessageActionRow()
                    .addComponents(
                        addBlacklistUserAFK = new MessageButton()
                        .setCustomId('addBlacklistedUserAFK')
                        .setStyle('PRIMARY')
                        .setLabel('Add Blacklisted User'),
        
                        removeBlacklistUserAFK = new MessageButton()
                        .setCustomId('removeBlacklistedUserAFK')
                        .setStyle('PRIMARY')
                        .setLabel('Remove Blacklisted User'),
                    )
        
                    const row3 = new MessageActionRow()
                    .addComponents(
                        endInteractionAFK = new MessageButton()
                        .setCustomId('endInteractionAFK')
                        .setStyle('DANGER')
                        .setLabel('End Interaction')
                    )
        
                    let embed = new MessageEmbed()
                    .setTitle('Testing buttons')
        
                    let msg = await message.channel.send({
                        embeds: [embed],
                        components: [row1, row2, row3]
                    })
                    
                    let filter = interaction => interaction.user.id === message.author.id

                    let collector = message.channel.createMessageComponentCollector(
                        {
                            filter,
                            time: 30000
                        }
                    )

                    collector.on('collect', interaction => {
                        const interactionID = interaction.customId

                        try {
                            if (interactionID === 'endInteractionAFK') {
                                row1.components[0].setDisabled(true)
                                row1.components[1].setDisabled(true)
                                row2.components[0].setDisabled(true)
                                row2.components[1].setDisabled(true)
                                row3.components[0].setDisabled(true)
        
                                msg.edit({
                                    embed: [embed],
                                    components: [row1, row2, row3],
                                    content: 'ended'
                                }).catch(e => {
                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                                })
                            } else if (interactionID === 'addWhitelistRoleAFK') {

                            }
                        } catch (err) {
                            console.log(err)

                            error(message, 'SETTINGS_AFK_SETTINGS_BUTTONS_ERR')
                        }
                    })

                    collector.on('end', collected => {
                        row1.components[0].setDisabled(true)
                        row1.components[1].setDisabled(true)
                        row2.components[0].setDisabled(true)
                        row2.components[1].setDisabled(true)
                        row3.components[0].setDisabled(true)

                        msg.edit({
                            embed: [embed],
                            components: [row1, row2, row3],
                            content: 'ended'
                        }).catch(e => {
                            console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be edited as an error has occured" + '\n\nError:\n' + e)
                        })
                    })

                } catch (err) {
                    console.log(err)

                    error(message, 'SETTINGS_AFK_SETTINGS_ERR')
                }
            } else if (command == 'snipe') { //Snipe Command 
                
            }
        }
    } catch (err) {
        console.log(err)

        error(message, 'SETTINGS_GENERAL_ERR')
    }
}



exports.data = {
    name: "settings",
    aliases: ['set'],
    usage: `settings <command>`
}