const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('twitch_announce')
        .setDescription('Configure Twitch live announcements')
        .addStringOption(option =>
            option.setName('twitch_name')
                .setDescription('Twitch username or link')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Announcement message')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('ping_everyone')
                .setDescription('Ping @everyone when live')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel where announcements will be posted')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {

        // ADMIN CHECK
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: 'You must be an **Administrator** to use this command.',
                ephemeral: true
            });
        }

        const twitchInput = interaction.options.getString('twitch_name');
        const message = interaction.options.getString('message');
        const pingEveryone = interaction.options.getBoolean('ping_everyone');
        const announceChannel = interaction.options.getChannel('channel');

        const twitchName = twitchInput
            .replace("https://www.twitch.tv/", "")
            .replace("https://twitch.tv/", "")
            .trim();

        await db.query(`
            DELETE FROM twitch_settings;
        `);

        await db.query(`
            INSERT INTO twitch_settings (twitch_name, message, ping_everyone, channel_id)
            VALUES ($1, $2, $3, $4)
        `, [
            twitchName,
            message,
            pingEveryone,
            announceChannel.id
        ]);

        await interaction.reply({
            content: `Twitch announcements updated:\n**Channel:** ${twitchName}\n**Message:** ${message}\n**Ping Everyone:** ${pingEveryone}\n**Announce Channel:** <#${announceChannel.id}>`,
            ephemeral: true
        });
    }
};
