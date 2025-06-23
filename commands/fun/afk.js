const { MessageEmbed } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const config = require('../../config');
const { error, convertMs } = require('../../functions');
exports.execute = async (client, message, args) => {

    try {
        const user = message.author
        let afkmsg
        let nick 
    
        if (!db.has(`${user.id}.${message.guild.id}.afk`)) {
            db.set(`${user.id}.${message.guild.id}.afk.status`, false)
            db.set(`${user.id}.${message.guild.id}.afk.message`, 'AFK')
            db.set(`${user.id}.${message.guild.id}.afk.timestamp`, Date.now())
        }
    
        if (!args[0]) {
            afkmsg = 'AFK'
        } else {
            afkmsg = args.join(' ')
        }
    
        if (afkmsg.length > 1024) {
            return message.reply('Message length cannot exceed `1,048` characters!');
        } 

        let settingafklist = [
            `<a:baibai:923786180900818955> <@${user.id}> I have set your AFK message to: ${afkmsg}`,
            `<a:baibai:923786180900818955> Looks like <@${user.id}> is going AFK! I have set your AFK message to: ${afkmsg}`,
            `<a:baibai:923786180900818955> Byeeeee <@${user.id}>! Your AFK message has been set to: ${afkmsg}`
        ]

        let comingbacklist = [
            `<a:cutewave:923784318084583445> Heya <@${user.id}>! It's nice to see you again, I have removed your AFK status.`,
            `<a:cutewave:923784318084583445> Welcome back <@${user.id}>! I have removed your AFK status.`,
            `<@${user.id}> you came back :D! Your AFK status has been removed.`
        ]

        let comingback = comingbacklist[Math.floor(Math.random() * comingbacklist.length)]
        let settingafk = settingafklist[Math.floor(Math.random() * settingafklist.length)]

        if (db.get(`${user.id}.cd.afk`) - Date.now() > 0) {
            return message.reply('Tsk Tsk Tsk, so you lied about going AFK <:bruh:923946086740144128>... Just for that, you will wait '+ convertMs(db.get(`${user.id}.cd.afk`) - Date.now(), true, false) +' before using the command again.').then(msg => {
                setTimeout(() => {
                    msg.delete().catch(err => {
                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                    });
                }, 7500);
            })
        }

        db.set(`${user.id}.cd.afk`, Date.now() + 10000)
        if (db.get(`${user.id}.${message.guild.id}.afk.status`) == true) {
            if (message.member.roles.highest.position >= message.guild.members.resolve(client.user).roles.highest.position || message.guild.ownerID == message.author.id) {
                db.set(`${user.id}.${message.guild.id}.afk.status`, false) 

                return message.channel.send(comingback).then(msg => {
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
    
                    error(message, err, 'AFK_NICKNAME_EDIT_ERR')
                }
    
                return message.channel.send(comingback).then(msg => {
                    setTimeout(() => {
                        msg.delete().catch(err => {
                            console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                        });
                    }, 10000)
                })
            }
        } else { //Setting AFK
            if (message.member.roles.highest.position >= message.guild.members.resolve(client.user).roles.highest.position || message.guild.ownerID == message.author.id) {
                db.set(`${user.id}.${message.guild.id}.afk.status`, true)
                db.set(`${user.id}.${message.guild.id}.afk.message`, afkmsg)
                db.set(`${user.id}.${message.guild.id}.afk.timestamp`, Date.now())

                return message.channel.send(settingafk)
            } else {
                db.set(`${user.id}.${message.guild.id}.afk.status`, true)
                db.set(`${user.id}.${message.guild.id}.afk.message`, afkmsg)
                db.set(`${user.id}.${message.guild.id}.afk.timestamp`, Date.now())
    
                if (message.member.displayName.startsWith('[AFK] ')) {
                    nick = message.member.displayName
                } else if (message.member.displayName.length + 6 > 32){
                    nick = message.member.displayName
                } else {
                    nick = `[AFK] ${message.member.displayName}`
                }

                try {
                    message.member.setNickname(nick)
                    return message.channel.send(settingafk)
                } catch (err) {
                    console.log(err)
    
                    error(message, err, 'AFK_NICKNAME_EDIT_ERR')
                }
            }
        }
    } catch (err) {
        console.log(err)

        error(message, err, 'AFK_SETUP_ERR')
    }
}

exports.data = {
    name: "afk",
    aliases: ["awayfromkeyboard"],
    usage: `afk [reason]`
}