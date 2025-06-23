const { SlashCommandBuilder } = require("@discordjs/builders");
const client = require("../../index.js")
const db = require('quick.db');
const components = require('../../components');
const functions = require('../../functions');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Check the latency between you, celestial and discord!"),

    async execute(client, interaction) {
        try {
            functions.interactionDefer(interaction, false).then(async () => {
                let botmsg = await interaction.editReply({content: "Boinking Discord..."}).catch(e => {
                    console.log(e)
                })

                let apilatency = Math.round(client.ws.ping, 0)
                let latency = botmsg.createdTimestamp - interaction.createdTimestamp;
    
                interaction.editReply(`🏓 Pong! **${client.user.username}** has a ` + '`' + latency + 'ms`' + ` ping to you and a ` + '`' + apilatency + 'ms`' + ` ping to Discord!`).catch(e => {
                    console.log(e)
                })
            })
        } catch (err) {
            functions.slashError(interaction, err, true, 'SLASHPING_GENERAL_ERR')
        }
    }
}
