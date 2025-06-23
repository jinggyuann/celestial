const { MessageEmbed, Message } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const { error, userPermissionCheck } = require('../../functions');
exports.execute = async (client, message, args) => {
    try {
        const user = message.author
        if (!args[0]) {
            let embed = new MessageEmbed()
            .setTitle(`${client.user.username}'s Command List!`)
            .setDescription("Currently under construction TT\n`afk`, `autoreaction`, `editsnipe`, `help`, `level`, `ping`, `prefix`, `settings`, `snipe`, `uptime`")
            .setColor('#B9FAFA')
            
            message.reply({
                embeds: [embed]
            })
        } else {
            let requiredHelp = args[0].toLowerCase()
    
            if (requiredHelp == 'ar' || requiredHelp == 'autoreaction') {
                let permissionCheck = userPermissionCheck(message, user.id, 'MANAGE_GUILD')
                if (!permissionCheck) return;

                let ar = new MessageEmbed()
                    .setTitle('**__Auto Reactions__**')
                    .setDescription("<a:blueright:923826794610704384> **What are auto reactions?**\nAuto reactions are functions which trigger when a specific key word is said.\n\n<a:blueright:923826794610704384> **How do I add an auto reaction?**\nAn auto reaction can be added by using the following command:\n\n> `"+ db.get(`${message.guild.id}.prefix`) +"autoreaction add <trigger> || <reaction>`\n\nExample :\n\n> `"+ db.get(`${message.guild.id}.prefix`) +"autoreaction add hello || Hi! How you doin?`\n\nImportant things to remember while adding auto reactions:\n<:continueReply:941030243295170620> The auto reaction command must include the ` - ` `||` to separate the **trigger** from the **reaction**.\n<:continueReply:941030243295170620> Auto reaction triggers must be less than `100` characters.\n<:continueReply:941030243295170620> Auto reaction reactions must be less than `2000` characters.\n<:continueReply:941030243295170620> You can only have a maximum of `50` auto reactions per server.\n<:continueReply:941030243295170620> You can replace the `add`  in the command with a `+`.\n<:endReply:941030019428397058> If you have an existing auto reaction with the same trigger, the reaction of the trigger will be updated to the newest reaction.\n\n<a:blueright:923826794610704384> **How do I remove an auto reaction?**\n\nAn auto reaction can be easily removed by using the following command:\n\n> `"+ db.get(`${message.guild.id}.prefix`) +"autoreaction remove <trigger>`\n\nExample: \n\n> `"+ db.get(`${message.guild.id}.prefix`) +"autoreaction remove hello`\n\nImportant things to remember while removing auto reactions:\n<:continueReply:941030243295170620> The given trigger must be a trigger that exists or an error will pop up.\n<:endReply:941030019428397058> You can replace the `remove`  in the command with a `-` or `delete`.\n\n<a:blueright:923826794610704384> **How do I see what auto reactions are in my server?**\n\nYou can easily view all available auto reactions by using the following command:\n\n> `"+ db.get(`${message.guild.id}.prefix`) +"autoreaction view`\n\nImportant things to remember while viewing auto reactions:\n<:endReply:941030019428397058> You can replace the `view`  in the command with a `list`.")
                    .addFields(
                        { 
                            name: '\u200B', 
                            value: '**__Stats__**' 
                        },
                        {
                            name: 'Base Command:',
                            value: "`"+ db.get(`${message.guild.id}.prefix`) +"autoreaction <type> <trigger> || <reaction>`",
                            inline: false
                        },
                        {
                            name: 'Aliases:',
                            value: '`ar`, `react`, `autor`, `autoreact`',
                            inline: true
                        },
                        {
                            name: 'Type:',
                            value: '`Utility`',
                            inline: true
                        },
                        {
                            name: 'Required Permissions:',
                            value: '`Manage Server`',
                            inline: true
                        }
                    )
                    .setColor('#B9FAFA')
                    .setThumbnail(user.displayAvatarURL())
                    
                return message.reply({
                    embeds: [ar]
                })
            } else if (requiredHelp == 'ping') {
                let ping = new MessageEmbed()
                .setTitle("**__PING__**")
                .setDescription("<a:blueright:923826794610704384>  **What is a ping command?**\nA ping command is a useful command to check the ping between **you** , **" + client.user.username + "** and **discord**!\n\n<a:blueright:923826794610704384>  **How to use the ping command?**\nWell the ping command is pretty straightforward and can be easily used by running the following command:\n\n> `"+ db.get(`${message.guild.id}.prefix`)+ "ping`")
                .addFields(
                    { 
                        name: '\u200B', 
                        value: '**__Stats__**' 
                    },
                    {
                        name: 'Base Command:',
                        value: "`"+ db.get(`${message.guild.id}.prefix`) +"ping`",
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
        
                return message.reply({
                    embeds: [ping]
                })
            } else if (requiredHelp == 'afk' || requiredHelp == 'awayfromkeyboard') {
                let afk = new MessageEmbed() 
                .setTitle('**__AFK__**')
                .setDescription("<a:blueright:923826794610704384> **What is the AFK command?**\nThe AFK command is used to show others in your server that you are currently AFK.\n\n<a:blueright:923826794610704384> **How to use the AFK command?**\n\nThe AFK command can easily be used by running the following command: \n\n> `" + db.get(`${message.guild.id}.prefix`) + "afk [message]`\n\nExample: \n\n> `" + db.get(`${message.guild.id}.prefix`) + "afk Heya, I'm going AFK!`\n\nThings to note when using AFK:\n<:endReply:941030019428397058> `[message]` is an optional argument and is not required if not needed")
                .addFields(
                    { 
                        name: '\u200B', 
                        value: '**__Stats__**' 
                    },
                    {
                        name: 'Base Command:',
                        value: "`"+ db.get(`${message.guild.id}.prefix`) +"afk [message]`",
                        inline: false
                    },
                    {
                        name: 'Aliases:',
                        value: '`awayfromkeyboard`',
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
            
                message.reply({
                    embeds: [afk]
                })
            } else if (requiredHelp == 'snipe') {
                let snipe = new MessageEmbed()
                .setTitle('**__SNIPE__**')
                .setDescription("\n<a:blueright:923826794610704384>  **What is a snipe command?**\nSnipe command is a fun command used to retrieve the most recently deleted message. \n\n<a:blueright:923826794610704384>  **How to use the snipe command?**\nYou can easily use the snipe command in your server by using the following command:\n\n> `"+ db.get(`${message.guild.id}.prefix`) +"snipe`\n\nImportant things to note when sniping:\n<:endReply:941030019428397058> Deleted message can only be sniped within **one hour** of deletion")
                .addFields(
                    { 
                        name: '\u200B', 
                        value: '**__Stats__**' 
                    },
                    {
                        name: 'Base Command:',
                        value: "`"+ db.get(`${message.guild.id}.prefix`) +"snipe`",
                        inline: false
                    },
                    {
                        name: 'Aliases:',
                        value: '`None`',
                        inline: true
                    },
                    {
                        name: 'Type:',
                        value: '`Fun`',
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
        
                return message.reply({
                    embeds: [snipe]
                })
            } else if (requiredHelp == 'editsnipe' || requiredHelp == 'esnipe') {
                let editsnipe = new MessageEmbed()
                .setTitle("**__EDITSNIPE__**")
                .setDescription("<a:blueright:923826794610704384>  **What is edit snipe?**\nEdit snipe is a command similar to the snipe command but instead of sniping deleted messages, edit snipe snipes the most recently edited message. Therefore, you can catch your friends on the act \<a:winkwink:924296849874100244>\n\n<a:blueright:923826794610704384> **How do I use edit snipe?**\nEdit snipe can be easily used by using the following command:\n\n> `"+ db.get(`${message.guild.id}.prefix`) +"editsnipe`\n\nImportant things to note when edit sniping:\n<:endReply:941030019428397058> The snipe will only work if the message was edited within **1 hour**.")
                .addFields(
                    { 
                        name: '\u200B', 
                        value: '**__Stats__**' 
                    },
                    {
                        name: 'Base Command:',
                        value: "`"+ db.get(`${message.guild.id}.prefix`) +"editsnipe`",
                        inline: false
                    },
                    {
                        name: 'Aliases:',
                        value: '`esnipe`',
                        inline: true
                    },
                    {
                        name: 'Type:',
                        value: '`Fun`',
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
        
                return message.reply({
                    embeds: [editsnipe]
                })
            
            } else if (requiredHelp == 'prefix') { 
                let prefix = new MessageEmbed()
                .setTitle("**__PREFIX__**")
                .setDescription("<a:blueright:923826794610704384> **What is a prefix command?**\nA prefix command can be used to remind you on the prefix of the server you are currently in. It is also be used to set a new prefix for your server.\n\n<a:blueright:923826794610704384>  **How do I check my server's prefix?**\nYou can easily check the prefix of your server by running the following command:\n\n> `" + db.get(`${message.guild.id}.prefix`) + "prefix`\n\nThings to note:\n\n1. If you do not remember the server's prefix, you can always ping me as your prefix!\n\nExample: <@"+ client.user.id +"> help\n\n<a:blueright:923826794610704384>  **How do I edit the prefix of my server?**\nAs a server manager, you can easily edit the server's prefix by running the following command:\n\n> `" + db.get(`${message.guild.id}.prefix`) + "prefix set <prefix>`\n\nExample: \n\n> `" + db.get(`${message.guild.id}.prefix`) + "prefix set c!`\n\nImportant things to note when setting up your prefix:\n<:continueReply:941030243295170620> Prefix length cannot exceed `10` characters or be less than `1` character long.\n<:endReply:941030019428397058> A server can only have `1` prefix at any given moment.")
                .addFields(
                    { 
                        name: '\u200B', 
                        value: '**__Stats__**' 
                    },
                    {
                        name: 'Base Command:',
                        value: "`"+ db.get(`${message.guild.id}.prefix`) +"prefix`",
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
        
                return message.reply({
                    embeds: [prefix]
                })
            } else if (requiredHelp == 'help') {
                let help = new MessageEmbed()
                .setTitle("**__HELP__**")
                .setDescription("\<a:blueright:923826794610704384> **What is a help command?**\nA help command is used to list out all available commands and provide further insight of a specific command.\n\n<a:blueright:923826794610704384>  **How do I see all available commands?**\nYou can easily see all available commands by using the following command: \n\n> `"+ db.get(`${message.guild.id}.prefix`) +"help`\n\n<a:blueright:923826794610704384>  **How do I get further insight and details of a specific command?**\nA command's details can be easily accessed by using the following command: \n\n> `"+ db.get(`${message.guild.id}.prefix`) +"help [command_name]`\n\nExample: \n\n> `"+ db.get(`${message.guild.id}.prefix`) +"help help`\n\nThings to note when checking the details of a specific command:\n<:continueReply:941030243295170620> Not all commands have further insights to them.\n<:endReply:941030019428397058> The `[command_name]` part of the command is **optional** and **not required**.\n3. `[command_name]` must be the full name of the command.")
                .addFields(
                    { 
                        name: '\u200B', 
                        value: '**__Stats__**' 
                    },
                    {
                        name: 'Base Command:',
                        value: "`"+ db.get(`${message.guild.id}.prefix`) +"help [command_name]`",
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
        
                return message.reply({
                    embeds: [help]
                })
            } else {
                return message.reply("No documentation found for the `"+ args[0] + "` command! Check out all available commands via "+ `${'`' + db.get(`${message.guild.id}.prefix`) + 'help`'}` + "!")
            }
        } 
    } catch (err) {
        console.log(err)

        error(message, 'HELP_GENERAL_ERR')
    }
}

exports.data = {
    name: "help",
    aliases: [],
    usage: `help <category>`
}