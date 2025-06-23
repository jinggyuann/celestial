let tips = [
    'tips\n\n',
    'tips\n\n'
]

class HelpEmbeds {
    interactionCommand(interaction, target) {
        const { MessageEmbed } = require('discord.js');
        const db = require('quick.db');
        const user = interaction.user
        switch(target) {
            default: 
                let help = new MessageEmbed()
                .setTitle("**__HELP__**")
                .setDescription("\<a:blueright:923826794610704384> **What is a help command?**\nA help command is used to list out all available commands and provide further insight of a specific command.\n\n<a:blueright:923826794610704384>  **How do I see all available commands?**\nYou can easily see all available commands by using the following command: \n\n> `"+ db.get(`${interaction.guild.id}.prefix`) +"help`\n\n<a:blueright:923826794610704384>  **How do I get further insight and details of a specific command?**\nA command's details can be easily accessed by using the following command: \n\n> `"+ db.get(`${interaction.guild.id}.prefix`) +"help [command_name]`\n\nExample: \n\n> `"+ db.get(`${interaction.guild.id}.prefix`) +"help help`\n\nThings to note when checking the details of a specific command:\n<:continueReply:941030243295170620> Not all commands have further insights to them.\n<:endReply:941030019428397058> The `[command_name]` part of the command is **optional** and **not required**.\n3. `[command_name]` must be the full name of the command.")
                .addFields(
                    { 
                        name: '\u200B', 
                        value: '**__Stats__**' 
                    },
                    {
                        name: 'Base Command:',
                        value: "`"+ db.get(`${interaction.guild.id}.prefix`) +"help [command_name]`",
                        inline: false
                    },
                    {
                        name: 'Aliases:',
                        value: '`None`',
                        inline: true
                    },
                    {
                        name: 'Type:',
                        value: '`Utility`',
                        inline: true
                    },
                    {
                        name: 'Required Permissions:',
                        value: '`None`',
                        inline: true
                    }
                )
                .setColor('#B9FAFA')
                .setThumbnail(user.displayAvatarURL())

                return help;
        }
    }
}

module.exports = { HelpEmbeds }
