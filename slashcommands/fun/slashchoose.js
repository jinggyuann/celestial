const { MessageEmbed } = require("discord.js");
const db = require('quick.db');
const components = require('../../components');
const { convertMs, interactionDefer } = require('../../functions');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
	.setName('choose')
	.setDescription('Let celestial choose for you!')
    .addStringOption(option =>
		option.setName('1st')
			.setDescription('The first option for celestial to choose from')
			.setRequired(true)
    )
    .addStringOption(option =>
		option.setName('2nd')
			.setDescription('The second option for celestial to choose from')
			.setRequired(true)
    )
    .addStringOption(option =>
		option.setName('3rd')
			.setDescription('The third option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('4th')
			.setDescription('The fourth option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('5th')
			.setDescription('The fifth option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('6th')
			.setDescription('The sixth option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('7th')
			.setDescription('The seventh option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('8th')
			.setDescription('The eighth option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('9th')
			.setDescription('The ninth option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('10th')
			.setDescription('The 10th option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('11th')
			.setDescription('The 11th option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('12th')
			.setDescription('The 12th option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('13th')
			.setDescription('The 13th option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('14th')
			.setDescription('The 14th option for celestial to choose from')
			.setRequired(false)
    )
    .addStringOption(option =>
		option.setName('15th')
			.setDescription('The 15th option for celestial to choose from')
			.setRequired(false)
    ),

    async execute(client, interaction) {
        const user = interaction.user
        let max = 25

        if ((db.get(`${user.id}.cd.choose`) - Date.now()) > 0) {
            interactionDefer(interaction, true).then(() => {
                  return interaction.editReply({
                      content: "You can't possibly have that many things that needs choosing QwQ. Wait " + convertMs(db.get(`${user.id}.cd.choose`) - Date.now(), true) + " before asking me to choose again!",
                      ephemeral: true
                  }).catch(e => {
                    console.log(e)
                  })
            })
        } else {
            let itemList = []
            let requiredItems = [ 
                interaction.options.getString('1st'),
                interaction.options.getString('2nd')
            ]
            let optionalItems = [ 
                interaction.options.getString('3rd'),
                interaction.options.getString('4th'),
                interaction.options.getString('5th'),
                interaction.options.getString('6th'),
                interaction.options.getString('7th'),
                interaction.options.getString('8th'),
                interaction.options.getString('9th'),
                interaction.options.getString('10th'),
                interaction.options.getString('11th'),
                interaction.options.getString('12th'),
                interaction.options.getString('13th'),
                interaction.options.getString('14th'),
                interaction.options.getString('15th'),
            ]

            requiredItems.forEach(item => {
                itemList.push(item)
            })

            optionalItems.forEach(item => {
                if (item && item !== null && item !== undefined) {
                    itemList.push(item)
                }
            })


            if (itemList.length > max) {
                interactionDefer(interaction, true)
                return interaction.editReply({
                    content: 'Maximum amount of choices that you can currently add is `' + max + '`.',
                    ephemeral: true
                }).catch(e => {
                  console.log(e)
                })
            } 
                
            let result = itemList[Math.floor(Math.random() * itemList.length)]
    
            db.set(`${user.id}.cd.choose`, Date.now() + 5000)
            interactionDefer(interaction, false).then(() => {
                return interaction.editReply({
                    content: `I choose ${ '`' + result + '`'}!`
                }).catch(e => {
                  console.log(e)
                })
            })

        }
    
    }
}