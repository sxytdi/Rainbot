const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll the dice to win coins')
        .addIntegerOption(opt => 
            opt.setName('bet')
                .setDescription('Amount to bet')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(opt =>
            opt.setName('prediction')
                .setDescription('Predict the outcome')
                .setRequired(true)
                .addChoices(
                    { name: 'Over 3 (Win 2x)', value: 'over' },
                    { name: 'Under 4 (Win 2x)', value: 'under' },
                    { name: 'Exact 6 (Win 5x)', value: 'six' }
                )),

    async execute(interaction, data, writeData) {
        const userId = interaction.user.id;
        const bet = interaction.options.getInteger('bet');
        const prediction = interaction.options.getString('prediction');

        if (data[userId] < bet) {
            return interaction.reply({ content: 'You do not have enough coins!', ephemeral: true });
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        let win = false;
        let multiplier = 0;

        if (prediction === 'over' && roll > 3) {
            win = true;
            multiplier = 2;
        } else if (prediction === 'under' && roll < 4) {
            win = true;
            multiplier = 2;
        } else if (prediction === 'six' && roll === 6) {
            win = true;
            multiplier = 5;
        }

        if (win) {
            const winnings = bet * multiplier;
            data[userId] += (winnings - bet);
            var resultMsg = `You rolled a **${roll}** and won **${winnings}** coins!`;
        } else {
            data[userId] -= bet;
            var resultMsg = `You rolled a **${roll}**. You lost your bet.`;
        }

        writeData(data);

        const embed = new EmbedBuilder()
            .setTitle('Rainbot | Dice Roll')
            .setDescription(resultMsg)
            .setColor('#2b2d42')
            .setFooter({ text: `New Balance: ${data[userId]} coins` });

        return interaction.reply({ embeds: [embed] });
    }
};
