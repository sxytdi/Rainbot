const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('highlow')
        .setDescription('Guess if the next card is higher or lower')
        .addIntegerOption(opt => 
            opt.setName('bet')
                .setDescription('Amount to bet')
                .setRequired(true)
                .setMinValue(1))
        .addStringOption(opt =>
            opt.setName('guess')
                .setDescription('Higher or Lower?')
                .setRequired(true)
                .addChoices(
                    { name: 'Higher', value: 'higher' },
                    { name: 'Lower', value: 'lower' }
                )),

    async execute(interaction, data, writeData) {
        const userId = interaction.user.id;
        const bet = interaction.options.getInteger('bet');
        const guess = interaction.options.getString('guess');

        if (data[userId] < bet) {
            return interaction.reply({ content: 'Insufficient funds!', ephemeral: true });
        }

        const firstCard = Math.floor(Math.random() * 12) + 1;
        const secondCard = Math.floor(Math.random() * 12) + 1;

        let win = false;
        if (guess === 'higher' && secondCard > firstCard) win = true;
        if (guess === 'lower' && secondCard < firstCard) win = true;
        if (firstCard === secondCard) win = false;

        let resultMsg = "";
        if (win) {
            data[userId] += bet;
            resultMsg = `The first card was **${firstCard}**. The second card was **${secondCard}**.\n\n**You won ${bet} coins!**`;
        } else {
            data[userId] -= bet;
            resultMsg = `The first card was **${firstCard}**. The second card was **${secondCard}**.\n\n**You lost ${bet} coins.**`;
        }

        writeData(data);

        const embed = new EmbedBuilder()
            .setTitle('Rainbot | High-Low')
            .setDescription(resultMsg)
            .setColor('#2b2d42')
            .setFooter({ text: `Balance: ${data[userId]} coins` });

        return interaction.reply({ embeds: [embed] });
    }
};
