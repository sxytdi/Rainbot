const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play blackjack')
        .addIntegerOption(opt => opt.setName('amount').setDescription('Coins to bet').setRequired(true)),
    async execute(interaction, data, writeData) {
        const bet = interaction.options.getInteger('amount');
        const userId = interaction.user.id;

        if (data[userId] < bet) return interaction.reply({ content: 'You do not have enough coins!', ephemeral: true });
        if (bet <= 0) return interaction.reply({ content: 'Enter a valid amount.', ephemeral: true });

        const draw = () => Math.floor(Math.random() * 10) + 2;
        let pHand = draw() + draw();
        let dHand = draw() + draw();

        let result = '';
        if (pHand > 21) {
            result = 'Bust! You lose.';
            data[userId] -= bet;
        } else if (pHand > dHand || dHand > 21) {
            result = 'You win!';
            data[userId] += bet;
        } else if (pHand === dHand) {
            result = 'Tie!';
        } else {
            result = 'Dealer wins.';
            data[userId] -= bet;
        }

        writeData(data);

        const embed = new EmbedBuilder()
            .setTitle(`Rainbot | ${result}`)
            .addFields(
                { name: 'Your Hand', value: `${pHand}`, inline: true },
                { name: 'Dealer Hand', value: `${dHand}`, inline: true },
                { name: 'New Balance', value: `${data[userId]} coins` }
            )
            .setColor('#2b2d42');

        await interaction.reply({ embeds: [embed] });
    }
};
