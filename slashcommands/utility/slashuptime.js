const { SlashCommandBuilder } = require("@discordjs/builders");
const client = require("../../index.js")
const db = require('quick.db');
const components = require('../../components');
const { interactionDefer, convertMs, slashError } = require("../../functions.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription("Check the uptime of celestial!"),

    async execute(client, interaction) {
        try {
            interactionDefer(interaction, false).then(() => {
                interaction.editReply({
                    content: `<a:online:923826409359687710> **${client.user.username}** has been online for ${convertMs(client.uptime, true)}!`
                }).catch(e => {
                    console.log(e)
                })
            })
        } catch (err) {
            slashError(interaction, err, true, 'SLASHUPTIME_GENERAL_ERR')
        }
    }
}
