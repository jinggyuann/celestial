const { Discord, Collection, Client } = require("discord.js");
const client = new Client({
    partials: [
        "CHANNEL"
    ],
    intents: [
        "GUILDS",
        "GUILD_MEMBERS",
        "GUILD_BANS",
        "GUILD_INTEGRATIONS",
        "GUILD_WEBHOOKS",
        "GUILD_INVITES",
        "GUILD_VOICE_STATES",
        "GUILD_PRESENCES",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "GUILD_MESSAGE_TYPING",
        "DIRECT_MESSAGES",
        "DIRECT_MESSAGE_REACTIONS",
        "DIRECT_MESSAGE_TYPING"
    ]
});

module.exports = client;
const db = require("quick.db");
client.config = require("./config");
client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();
const fs = require("fs");

fs.readdir("./slashcommands/", (err, files) => { //Slash commands files loading into client
    if (err) return console.error(err);
    files.forEach(f => {
        if (f.endsWith(".js")) {
            throw Error(`${f} is not categorized into any folders! Please categorize them before proceeding.`);
        } else {
            let file = f
            fs.readdir(`./slashcommands/${file}`, (err, files) => {
                if (err) return console.error(err);
                files.forEach(f => {
                    if (!f.endsWith(".js")) {
                        throw Error(`${f} is not a valid command file! Please fix the error by adding a .js behind the file name!`);
                    } else {
                        let command = require(`./slashcommands/${file}/${f}`);            
                        client.slashCommands.set(command.data.name, command.data)
                    }
                })
            });
        }
    });
});

fs.readdir("./events/", (err, files) => { //Event files loading into Client
    if (err) return console.error(err);
    files.forEach(f => {
        if (!f.endsWith(".js")) return;
        const event = require(`./events/${f}`);
        let eventName = f.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});

fs.readdir("./commands/", (err, files) => { //Command files loading into Client
    if (err) return console.error(err);
    files.forEach(f => {
        if (f.endsWith(".js")) {
            throw Error(`${f} is not categorized into any folders! Please categorize them before proceeding.`);
        } else {
            let file = f
            fs.readdir(`./commands/${file}`, (err, files) => {
                if (err) return console.error(err);
                files.forEach(f => {
                    if (!f.endsWith(".js")) {
                        throw Error(`${f} is not a valid command file! Please fix the error by adding a .js behind the file name!`);
                    } else {
                        let command = require(`./commands/${file}/${f}`);
                        client.commands.set(command.data.name, command);
                        command.data.aliases.forEach(alias => {
                            client.aliases.set(alias, command.data.name);
                        })
                    }
                })
            });
        }
    });
});


client.login(client.config.token);