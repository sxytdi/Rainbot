const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Play the slot machine')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Amount to bet')
                .setRequired(true)
                .setMinValue(1)),

    async execute(interaction, data, writeData) {
        const userId = interaction.user.id;
        const bet = interaction.options.getInteger('bet');

        if (data[userId] < bet) {
            return interaction.reply({ 
                content: `Insufficient funds. Balance: ${data[userId]}`, 
                ephemeral: true 
            });
        }

        const emojis = ['🍎', '💎', '🍋', '🍒', '🔔', '⭐'];
        const s1 = emojis[Math.floor(Math.random() * emojis.length)];
        const s2 = emojis[Math.floor(Math.random() * emojis.length)];
        const s3 = emojis[Math.floor(Math.random() * emojis.length)];

        let win = 0;
        let msg = "";

        if (s1 === s2 && s2 === s3) {
            win = bet * 5;
            msg = `**JACKPOT!** You won ${win} coins!`;
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            win = Math.floor(bet * 1.5);
            msg = `Nice! You won ${win} coins!`;
        } else {
            win = 0;
            msg = `You lost ${bet} coins.`;
        }

        data[userId] = data[userId] - bet + win;
        writeData(data);

        const embed = new EmbedBuilder()
            .setTitle('Rainbot | Slots')
            .setDescription(`**[ ${s1} | ${s2} | ${s3} ]**\n\n${msg}`)
            .setColor('#2b2d42')
            .setFooter({ text: `Balance: ${data[userId]}` });

        return interaction.reply({ embeds: [embed] });
    },
};
