const { interactionDefer } = require('../functions');
const db = require('quick.db');

module.exports = async (client, interaction) => {
    try {
        //Autocomplete system
        if (interaction.isAutocomplete()) {
            const fs = require('fs');

            fs.readdir('./autocomplete/', (err, files) => {
                try {
                    if (err) {
                        return console.log(err)
                    } 
    
                    let interactionName = interaction.commandName
                    let fileName = 'slash' + interactionName + 'AC.js'
                    
                    files.forEach(f => {
                        if (f == fileName) {
                            let fileData = require(`../autocomplete/${fileName}`)
                            fileData.execute(client, interaction)
                        }
                    })
                } catch (err) {
                    console.log(err)
                }
            })
        }

        if (interaction.isButton()) { //Processing button interactions
            try {
                const db = require('quick.db');
                const { MessageEmbed } = require('discord.js');

                if (!interaction.deferred) {
                    await interaction.deferUpdate()
                }

                if (!db.has(`${interaction.user.id}.buttonUsage`)) {
                    db.set(`${interaction.user.id}.buttonUsage.usage`, false)
                    db.set(`${interaction.user.id}.buttonUsage.timestamp`, null)
                    db.set(`${interaction.user.id}.buttonUsage.lastUsedCmd`, 'buttonUsageSetup')
                }

                //Fixing if the buttonUsage has an error where it is always true despite no interaction buttons
                if (db.get(`${interaction.user.id}.buttonUsage.usage`)) {
                    if ((Date.now() - db.get(`${interaction.user.id}.buttonUsage.timestamp`)) > 120000) {
                        db.set(`${interaction.user.id}.buttonUsage.usage`, false)
                    } else { //Stopping any commands from going through if there is an ongoing interaction
                        interactionDefer(interaction, true).then(() => {
                            let embed = new MessageEmbed()
                            .setDescription('<:celestialError:994174557642575872> You currently have an ongoing button interaction. Please end the button interaction before proceeding with another command.')
                            .setColor('RED')

                            return interaction.followUp({
                                embeds: [embed],
                                ephemeral: true
                            })
                        })
                    }
                }
            } catch (err) {
                console.log(err)
            }
        } else if (interaction.isCommand()) { //Processing slash commands
            const fs = require('fs');
            let interactionName = interaction.commandName
            let fileName = 'slash' + interactionName + '.js'

            //Fixing if the buttonUsage has an error where it is always true despite no interaction buttons
            if (db.has(`${interaction.user.id}.buttonUsage.usage`)) {
                if ((Date.now() - db.get(`${interaction.user.id}.buttonUsage.timestamp`)) > 120000) {
                    db.set(`${interaction.user.id}.buttonUsage.usage`, false)
                } else { //Stopping any commands from going through if there is an ongoing interaction
                    return interactionDefer(interaction, true).then(() => {
                        let embed = new MessageEmbed()
                        .setDescription('<:celestialError:994174557642575872> You currently have a command/button interaction ongoing. Please end the ongoing command/button interaction proceeding with another command.')
                        .setColor('RED')

                        return interaction.editReply({
                            embeds: [embed],
                            ephemeral: true
                        });
                    });
                }
            }

            //Execute slash comamnds
            fs.readdir('./slashcommands/', (err, files) => {
                if (err) {
                    return console.log(err)
                }
                files.forEach(f => {
                    if (f.endsWith('.js')) {
                        throw Error(`${f} is not categorized into any folders! Please categorize them before proceeding`)
                    } else {
                        let file = f
                        fs.readdir(`./slashcommands/${file}/`, (err, files) => {
                            if (err) {
                                return console.log(err)
                            }

                            
                            files.forEach(f => {
                                if (f == fileName) {
                                    let command = require(`../slashcommands/${file}/${fileName}`)
                                    command.execute(client, interaction)
                                }
                            })
                        })
                    }
                })
            })  
        }
    } catch (err) {
        console.log(err);
    }
};