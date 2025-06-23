const config = require('../config');
const db = require('quick.db');
const components = require('../components');
const { error, buttonsUsage, autoDelete } = require('../functions');
module.exports = async (client, message) => {

    //========== Mantainance Section ==========
    const mantainance = false
    const mantainancemessage = ""
    const mantainanceimmune = config.dev
    //========== Mantainance Section End ==========

    const user = message.author

    let perms = [
        'VIEW_CHANNEL',
        "ADD_REACTIONS",
        "SEND_MESSAGES",
        "MANAGE_MESSAGES",
        "EMBED_LINKS",
        "ATTACH_FILES",
        "READ_MESSAGE_HISTORY",
        "MENTION_EVERYONE",
        "USE_EXTERNAL_EMOJIS",
        "CHANGE_NICKNAME",
        "MANAGE_NICKNAMES",
        "USE_APPLICATION_COMMANDS"
    ]

    if (message.channel.type == 'DM') {
        console.log("\x1b[36m[EVENT]\x1b[37m A message has been sent or received via DMs!")
    } else if (!message.guild.me.permissions.has(perms)) {
        console.log("[\x1b[33mWARNING\x1b[37m] Bot Missing Permissions")
    } else if (message.author.bot) {
        return;
    } else { 
        try {
            const db = require("quick.db");
            if (db.get(`${message.author.id}.cd.commands`) - Date.now() > 0) { //Prevent Bot from getting rate limited
                return db.set(`${message.author.id}.cd.commands`, parseInt(db.get(`${message.author.id}.cd.commands`)) + 750);
            }

            //Fixing if the buttonUsage has an error where it is always true despite no interaction buttons
            if (db.get(`${message.author.id}.buttonUsage.usage`)) {
                if ((Date.now() - db.get(`${interaction.user.id}.buttonUsage.timestamp`)) > 120000) {
                    db.set(`${interaction.user.id}.buttonUsage.usage`, false)
                } else {
                    return message.reply({
                        content: 'test',
                        ephemeral: true
                    })
                }
            }
            
            let autoreactions = db.get(`${message.guild.id}.arlist`)

            if (autoreactions) {
                let msgcontent = message.content.toLowerCase()
                let wordCheck = msgcontent.split(' ')
                let trigger

                for (let i = 0; i < autoreactions.length; i++) {
                    if (msgcontent.includes(autoreactions[i])) {
                        trigger = {
                            'triggerWord': autoreactions[i],
                            'reaction': db.get(`${message.guild.id}.ar.${autoreactions[i]}.reaction`),
                            'type': db.get(`${message.guild.id}.ar.${autoreactions[i]}.type`)
                        }
                    }
                }

                if (trigger && trigger.triggerWord && trigger.reaction) {
                    try {
                        if (!trigger.type || trigger.type == 1) { // Normal
                            if (msgcontent.includes(trigger.triggerWord)) {
                                db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                                message.channel.send(trigger.reaction)
                            }
                        } else if (trigger.type == 2) { // Normal Word Check
                            for (let i = 0; i < wordCheck.length; i++) {
                                if (wordCheck[i] == trigger.triggerWord) {
                                    db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                                    message.channel.send(trigger.reaction)
                                }
                            }
                        } else if (trigger.type == 3) { // Exact
                            if (msgcontent == trigger.triggerWord) {
                                db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                                message.channel.send(trigger.reaction)
                            }
                        } else if (trigger.type == 4) { // StartsWith
                            for (let i = 0; i < wordCheck.length; i++) {
                                if (wordCheck[i].startsWith(trigger.triggerWord)) {
                                    db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                                    message.channel.send(trigger.reaction)
                                }
                            }
                        } else if (trigger.type == 5) { // StartsWithFull
                            if (msgcontent.startsWith(trigger.triggerWord)) {
                                db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                                message.channel.send(trigger.reaction)
                            }
                        } else if (trigger.type == 6) { // EndsWith
                            for (let i = 0; i < wordCheck.length; i++) {
                                if (wordCheck[i].endsWith(trigger.triggerWord)) {
                                    db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                                    message.channel.send(trigger.reaction)
                                }
                            }
                        } else if (trigger.type == 7) { // EndsWithFull
                            if (msgcontent.endsWith(trigger.triggerWord)) {
                                db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                                message.channel.send(trigger.reaction)
                            }
                        }
                    } catch (err) {
                        error(message, err, 'AUTOREACTION_REACTION_ERR')
                    }
                }
            }
        
            if (db.has(`${message.guild.id}.prefix`) == false) { //Setting Prefix
                db.set(`${message.guild.id}.prefix`, client.config.prefix)
            }
    
            if (db.get(`${message.author.id}.${message.guild.id}.afk.status`) == true) {
                let comingbacklist = [
                    `<a:cutewave:923784318084583445> Heya <@${user.id}>! It's nice to see you again, I have removed your AFK status.`,
                    `<a:cutewave:923784318084583445> Welcome back <@${user.id}>! I have removed your AFK status.`,
                    `<@${user.id}> you came back :D! Your AFK status has been removed.`
                ]
        
                let comingback = comingbacklist[Math.floor(Math.random() * comingbacklist.length)]

                if ((db.get(`${message.author.id}.${message.guild.id}.afk.timestamp`) + 15000) - Date.now() < 0) {
                    if (message.member.roles.highest.position >= message.guild.members.resolve(client.user).roles.highest.position || message.guild.ownerID == message.author.id) {
                        db.set(`${user.id}.${message.guild.id}.afk.status`, false)
            
                        message.channel.send(comingback).then(msg => {
                            setTimeout(() => {
                                msg.delete().catch(err => {
                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                }); 
                            }, 10000)
                        })
                    } else {
                        db.set(`${user.id}.${message.guild.id}.afk.status`, false) 
    
                        if (message.member.displayName.startsWith('[AFK] ')) {
                            nick = message.member.displayName.split('[AFK] ')[1]
                        } else {
                            nick = message.member.displayName
                        }
            
                        try {
                            message.member.setNickname(nick)
                        } catch (err) {
                            console.log(err)
            
                            error(message, 'AFK_NICKNAME_EDIT_ERR')
                        }
    
                        message.channel.send(comingback).then(msg => {
                            setTimeout(() => {
                                msg.delete().catch(err => {
                                    console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                                }); 
                            }, 10000)
                        })
                    }
                }
            }
    
            if (message.mentions.members.first()) {
                let user2 = message.mentions.members.first()
                
                if (user2 && user2.id !== message.author.id) {
                    if (db.get(`${user2.id}.${message.guild.id}.afk.status`) == true) {
                        db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                        let nick = user2.nickname

                        if (!nick || nick == null) {
                            nick = user2.user.username
                        } 

                        if (nick.includes('[AFK] ')) {
                            nick = nick.split('[AFK] ')[1]
                        }

                        return message.channel.send(`${'`' + nick + '` is currently AFK with the message: '}${db.get(`${user2.id}.${message.guild.id}.afk.message`)} - <t:${Math.floor(db.get(`${user2.id}.${message.guild.id}.afk.timestamp`) / 1000)}:R>`)
                    }
                }
            }
            
            if (!message.content.toLowerCase().startsWith(db.get(`${message.guild.id}.prefix`)) && !message.mentions.has(client.user.id) && !message.content.toLowerCase().startsWith(client.config.prefix)) {
                return;
            } else {
                if (!message.channel.permissionsFor(client.user).has(perms)) {
                    console.log("[\x1b[33mWARNING\x1b[37m] Missing Permissions to execute commands in "+message.channel+"")
                } else {
                    function settings() {
                        let args
                        if (message.mentions.has(client.user.id)) {
                            if (message.content.includes(`<@!${client.user.id}>`)) {
                                args = message.content.replace(`<@!${client.user.id}>`, `${client.config.prefix.toLowerCase()}`).slice(client.config.prefix.length).trim().split(" ")
                            } else {
                                args = message.content.replace(`<@${client.user.id}>`, `${client.config.prefix.toLowerCase()}`).slice(client.config.prefix.length).trim().split(" ")
                            }
                        } else {
                            args = message.content.slice(client.config.prefix.length).trim().split(" ")
                        }

                        if (message.content.toLowerCase().startsWith(db.get(`${message.guild.id}.prefix`))) {
                            args = message.content.toLowerCase().replace(`${db.get(`${message.guild.id}.prefix`)}`, `${client.config.prefix}`).slice(client.config.prefix.length).trim().split(" ")
                        }

                        if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) { //Checking if message is just a bot mention (if yes, prefix message will pop up)
                            if (db.get(`${message.author.id}.cd.commands`) - Date.now() < 0) {
                                db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                                message.reply("Aiyo did you forget my prefix?! <:hmph:924307894294433822> Since you forgot what it is, allow me to remind you that my prefix is `"+ db.get(`${message.guild.id}.prefix`) +"` so don't you forget that again :v If that's too hard to remember, you can always **ping me** as your prefix <:flustered:924308705409925150>");
                            }
                        }

                        let buttonUsage = db.get(`${message.author.id}.buttonUsage`)
                        if (buttonUsage == true) {
                            let botmsg = message.reply('You currently have a button interaction ongoing. Please end the ongoing interaction to proceed.').then((botmsg => {
                                autoDelete(botmsg, 5000)
                            }))
                        }

                        let commandName = args.shift().toLowerCase();
                        let command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
    
                        if (!command) {
                            return;
                        }

                        db.set(`${message.author.id}.cd.commands`, Date.now() + 750)
                        command.execute(client, message, args)
                    }
    
                    if (!message.author.id.includes(mantainanceimmune)) {
                        if (mantainance == true) {
                            if (mantainancemessage == '') {
                                mantainancemessage = 'Currently Under Mantainance'
                            }
                            return message.reply(mantainancemessage)
                        } else {
                            settings()
                        }
                    } else {
                        settings()
                    }
                }
            }
        } catch (err) {
            console.log(err)
            
            error(message, 'MESSAGE_CREATE_ERR')
        }
    }
};
