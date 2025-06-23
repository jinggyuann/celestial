exports.execute = async (client, interaction) => {
    const db = require('quick.db')
    const { interactionUserPermissionCheck } = require('../functions')
    let subcommandName = interaction.options.getSubcommand()
    try {
        if (!interaction.guild) return;
        if (!interactionUserPermissionCheck(interaction, interaction.user.id, 'MANAGE_GUILD')) return;

        if (subcommandName == 'info') {
            const focusedValue = interaction.options.getFocused();
            const choices = db.get(`${interaction.guild.id}.arlist`);
            const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
    
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
        } else if (subcommandName == 'add') {
            const focusedValue = interaction.options.getFocused();
            const choices = [
                'NORMAL',
                'NORMAL_WORD',
                'EXACT',
                'STARTS_WITH',
                'ENDS_WITH',
                'STARTS_WITH_FULL',
                'ENDS_WITH_FULL'
            ];
    
            const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
    
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
        } else if (subcommandName == 'edit') {
            const focusedValue = interaction.options.getFocused();
            let choices
    
            choices = db.get(`${interaction.guild.id}.arlist`)
    
            const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
    
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
        } else if (subcommandName == 'delete') {
            const focusedValue = interaction.options.getFocused();
            const choices = db.get(`${interaction.guild.id}.arlist`);
            const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
    
            await interaction.respond(
                filtered.map(choice => ({ name: choice, value: choice })),
            );
        }
    } catch (e) {
        console.log(e)
    }
}