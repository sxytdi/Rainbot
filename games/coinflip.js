const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Bet on heads or tails')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Heads or Tails')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                ))
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Amount to bet')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction, data, writeData) {
        const userId = interaction.user.id;
        const choice = interaction.options.getString('choice');
        const bet = interaction.options.getInteger('bet');

        if (data[userId] < bet) {
            return interaction.reply({ 
                content: `Insufficient funds. Balance: ${data[userId]}`, 
                ephemeral: true 
            });
        }

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const win = choice === result;
        
        if (win) {
            data[userId] += bet;
        } else {
            data[userId] -= bet;
        }

        writeData(data);

        const embed = new EmbedBuilder()
            .setTitle('Rainbot | Coinflip')
            .setDescription(`The coin landed on **${result.toUpperCase()}**!`)
            .setColor('#2b2d42')
            .addFields(
                { name: 'Result', value: win ? `You won ${bet} coins!` : `You lost ${bet} coins.`, inline: true },
                { name: 'New Balance', value: `${data[userId]} coins`, inline: true }
            );

        return interaction.reply({ embeds: [embed] });
    },
};
