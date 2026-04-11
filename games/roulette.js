const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Bet on a color')
        .addIntegerOption(opt => 
            opt.setName('bet')
                .setDescription('Amount to bet')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(opt =>
            opt.setName('color')
                .setDescription('Pick a color')
                .setRequired(true)
                .addChoices(
                    { name: 'Red (2x)', value: 'red' },
                    { name: 'Black (2x)', value: 'black' },
                    { name: 'Green (14x)', value: 'green' }
                )),

    async execute(interaction, data, writeData) {
        const userId = interaction.user.id;
        const bet = interaction.options.getInteger('bet');
        const color = interaction.options.getString('color');

        if (data[userId] < bet) {
            return interaction.reply({ content: 'Insufficient funds!', ephemeral: true });
        }

        const chance = Math.floor(Math.random() * 37);
        let resultColor = '';
        let multiplier = 0;

        if (chance === 0) {
            resultColor = 'green';
        } else if (chance % 2 === 0) {
            resultColor = 'black';
        } else {
            resultColor = 'red';
        }

        const win = color === resultColor;
        
        if (win) {
            multiplier = resultColor === 'green' ? 14 : 2;
            const winnings = bet * multiplier;
            data[userId] += (winnings - bet);
            var msg = `The ball landed on **${resultColor.toUpperCase()}**! You won **${winnings}** coins!`;
        } else {
            data[userId] -= bet;
            var msg = `The ball landed on **${resultColor.toUpperCase()}**. You lost **${bet}** coins.`;
        }

        writeData(data);

        const embed = new EmbedBuilder()
            .setTitle('Rainbot | Roulette')
            .setDescription(msg)
            .setColor('#2b2d42')
            .setFooter({ text: `Balance: ${data[userId]} coins` });

        return interaction.reply({ embeds: [embed] });
    }
};
