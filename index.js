const { Client, GatewayIntentBits, Collection, REST, Routes, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
client.commands = new Collection();
const cooldowns = new Collection();

const DATA_PATH = path.join(__dirname, 'balances.json');

function readData() {
    if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(DATA_PATH));
}

function writeData(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

const commands = [
    {
        name: 'grant',
        description: 'Grant coins to a user',
        default_member_permissions: PermissionFlagsBits.Administrator.toString(),
        options: [
            { name: 'user', type: 6, description: 'The user to grant coins to', required: true },
            { name: 'amount', type: 4, description: 'Amount of coins', required: true }
        ]
    },
    {
        name: 'leaderboard',
        description: 'View the richest players'
    }
];

const foldersPath = path.join(__dirname, 'games');
if (fs.existsSync(foldersPath)) {
    const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(foldersPath, file));
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }
}

client.on('messageCreate', async message => {
    if (message.channelId !== 'hi, put a channel id here for the channel u wanna use this in. :)') return;
    setTimeout(async () => {
        try {
            const fetchedMessage = await message.fetch(true);
            if (!fetchedMessage.pinned) {
                await fetchedMessage.delete();
            }
        } catch (error) {
            console.log(`[DELETE FAILED] ID: ${message.id} | Error: ${error.message}`);
        }
    }, 15000);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.channelId !== 'hi, put a channel id here for the channel u wanna use this in. :)') {
        return interaction.reply({ content: 'This bot can only be used in the designated channel.', ephemeral: true });
    }

    const accountAge = Date.now() - interaction.user.createdTimestamp;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (accountAge < sevenDays) {
        return interaction.reply({ content: 'Your account must be at least 7 days old to use Rainbot.', ephemeral: true });
    }

    const commandName = interaction.commandName;
    const userId = interaction.user.id;

    if (client.commands.has(commandName)) {
        const now = Date.now();
        const cooldownAmount = 15 * 1000;

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({
                    content: `Please wait ${timeLeft.toFixed(1)} more seconds.`,
                    ephemeral: true
                });
            }
        }

        cooldowns.set(userId, now);
        setTimeout(() => cooldowns.delete(userId), cooldownAmount);
    }

    let data = readData();
    if (!data[userId]) {
        data[userId] = 10;
        writeData(data);
    }

    if (commandName === 'grant') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        data[target.id] = (data[target.id] || 10) + amount;
        writeData(data);
        return interaction.reply(`Granted ${amount} coins to ${target.username}. Balance: ${data[target.id]}`);
    }

    if (commandName === 'leaderboard') {
        const sorted = Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        let leaderboardString = "";
        for (let i = 0; i < sorted.length; i++) {
            const [id, bal] = sorted[i];
            try {
                const user = await client.users.fetch(id);
                leaderboardString += `**${i + 1}.** ${user.username} • ${bal} coins\n`;
            } catch {
                leaderboardString += `**${i + 1}.** Unknown User (${id}) • ${bal} coins\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('Rainbot | Global Leaderboard')
            .setDescription(leaderboardString || 'No data yet.')
            .setColor('#2b2d42')
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }

    const command = client.commands.get(commandName);
    if (command) {
        try {
            await command.execute(interaction, data, writeData);
        } catch (error) {
            console.error(error);
        }
    }
});

const rest = new REST().setToken('hey! enter ur discord token here :)');
(async () => {
    try {
        await rest.put(Routes.applicationCommands('and, client id here.'), { body: commands });
        client.login('hey! enter ur discord token here :)');
    } catch (e) { console.error(e); }
})();
