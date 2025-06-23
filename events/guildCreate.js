module.exports = (client, guild, message) => {
    //Preparing and registering slash commands in new server after bot is up and online
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v9');
    const rest = new REST({ version: '9' }).setToken(client.config.token);
    
    (async () => {
        try {
            console.log('\x1b[34m[ACTION STARTED] \x1b[37mStarted refreshing slash commands in a new guild.\nGuild name:' + ` ${guild.name}\nGuild ID: ${guild.id}\nGuild owner: ${client.users.cache.find(u => u.id === guild.ownerId).tag}\nGuild owner ID: ${client.users.cache.find(u => u.id === guild.ownerId).id}`);
            
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, guild.id),
                { body: client.slashCommands },
            );
    
            console.log('\x1b[32m[SUCCESS] \x1b[37mSuccessfully loaded slash commands in the new guild.');
        } catch (error) {
            console.error(error);
        }
    })();

    //Setting up new database for newly added servers
    let { Database } = require('../database/main.js');
    let db = new Database()
    db.setNewServerData(guild.id, {
        _id: guild.id,
        prefix: 'c.'
    })
}