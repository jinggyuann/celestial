const { MessageEmbed } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const { error, convertMs, spaceGenerator } = require('../../functions');

exports.execute = async (client, message, args) => {
    const user = message.author
    let max = 25

    try {
        if ((db.get(`${user.id}.cd.choose`) - Date.now()) > 0) {
            return message.reply("You can't possibly have that many things that needs choosing QwQ. Wait " + convertMs(db.get(`${user.id}.cd.choose`) - Date.now(), true) + " before asking me to choose again!").then(msg => {
                setTimeout(() => {
                    msg.delete().catch(err => {
                        console.log("\x1b[35m[MINOR ERROR]\x1b[37m Message cannot be deleted as an error has occured" + '\n\nError:\n' + err)
                    })
                }, 5000)
            })
        } else if (!args[0] && !args[1]) {
            let missingarguments = new MessageEmbed()
            .setDescription("```\n" + db.get(`${message.guild.id}.prefix`)+ "choose <option_1> <option_2> [option_3] ...\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "       ^^^^^^^^^^ ^^^^^^^^^^\n```\n\n` - ` `<>` are required arguments\n` - ` `[]` are optional arguments")
            .setColor('#2e3036')

            return message.reply({
                embeds: [missingarguments],
                content: 'Missing required arguments!'
            })
        } else if (!args[1]) {
            let missingarguments = new MessageEmbed()
            .setDescription("```\n" + db.get(`${message.guild.id}.prefix`)+ "choose <option_1> <option_2> [option_3] ...\n" + spaceGenerator(db.get(`${message.guild.id}.prefix`)) + "                  ^^^^^^^^^^\n```\n\n` - ` `<>` are required arguments\n` - ` `[]` are optional arguments")
            .setColor('#2e3036')

            return message.reply({
                embeds: [missingarguments],
                content: 'Missing required arguments!'
            })
        
        } else {
            if (args.join(' ').includes(',')) {
                let select = []
                let temp = args.join(' ')
                temp = temp.split(/,/g)
                temp.forEach(item => {
                    item = item.split('')
    
                    if (item[0] == ' ') {
                        item.shift()
                    } else if (item[item.length - 1] == ' ') {
                        item.pop()
                    }
    
                    item = item.join('')
                    select.push(item)
                });

                if (select.length > max) {
                    return message.reply('Maximum amount of choices that you can currently add is `' + max + '`.')
                } 

                let result = select[Math.floor(Math.random() * select.length)]
    
                db.set(`${message.author.id}.cd.choose`, Date.now() + 5000)
                return message.reply(`I choose ${ '`' + result + '`'}!`)
            } else {
                if (args.length > max) {
                    return message.reply('Maximum amount of choices that you can currently add is `' + max + '`.')
                } 
                
                let result = args[Math.floor(Math.random() * args.length)]
    
                db.set(`${message.author.id}.cd.choose`, Date.now() + 5000)
                return message.reply(`I choose ${ '`' + result + '`'}!`)
            }
        }
    } catch (err) {
        console.log(err)

        error(message, 'CHOOSE_ERR')
    }
}

exports.data = {
    name: "choose",
    aliases: ["select"],
    usage: `choose <option 1> <option 2>`
}