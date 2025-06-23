module.exports = (client) => {
    try {
        //Bot is successfully booted up and online
        console.log(`\x1b[32m[SUCCESS] \x1b[37m${client.user.tag} is online!`);

        setInterval(() => {
            var arrayOfStatus = [
                `${client.guilds.cache.size} servers!`,
                `c.help!`,
                `dumbasses chat :c`
              ]
              
              client.user.setStatus('online')
              client.user.setActivity(
                  `${arrayOfStatus[Math.floor(Math.random() * arrayOfStatus.length)]}`,
                  {type: 'WATCHING'}
              )
        }, 30000);
    } catch (err) {
        console.log(err)
    }

    //Preparing and registering slash commands after bot is up and online
    const { REST } = require('@discordjs/rest');
    const { Routes } = require('discord-api-types/v9');
    const rest = new REST({ version: '9' }).setToken(client.config.token);
    
    (async () => {
        try {
            console.log('\x1b[34m[ACTION STARTED]\x1b[37m Started refreshing slash commands globally.');
            
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: client.slashCommands },
            );
    
            console.log('\x1b[32m[SUCCESS] \x1b[37mSuccessfully loaded slash commands.');
        } catch (error) {
            console.error(error);
        }
    })();

    //Testing connection to mongoDB
    console.log('\x1b[34m[ACTION STARTED]\x1b[37m Started connection test to mongoDB servers.')
    const { Database } = require('../database/main');
    const db = new Database()
    db.connectionTest();
}