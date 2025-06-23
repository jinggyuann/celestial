const { SlashCommandBuilder } = require("@discordjs/builders");
const client = require("../../index.js")
const db = require('quick.db');
const { HelpEmbeds } = require('../../components');
const { interactionDefer, convertMs, slashError } = require("../../functions.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription("Information on the bot!"),

    async execute(client, interaction) {
        try {
            interactionDefer(interaction, false).then(() => {
                let help = new HelpEmbeds()
                let embed = help.interactionCommand(interaction)
                interaction.editReply({ 
                    embeds: [embed]
                }).catch(e => {
                    console.log(e)
                })
            })
        } catch (err) {
            slashError(interaction, err, true, 'SLASHUPTIME_GENERAL_ERR')
        }
    }
}
