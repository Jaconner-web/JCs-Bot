const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../utils/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube_announce')
        .setDescription('Configure YouTube upload announcements')
        .addStringOption(option =>
            option.setName('channel')
                .setDescription('YouTube channel link or ID')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Announcement message')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('ping_everyone')
                .setDescription('Ping @everyone on new upload')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('announce_channel')
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

        const input = interaction.options.getString('channel');
        const message = interaction.options.getString('message');
        const pingEveryone = interaction.options.getBoolean('ping_everyone');
        const announceChannel = interaction.options.getChannel('announce_channel');

        let channelId = input;

        if (input.includes("youtube.com")) {
            const match = input.match(/channel\/([^\/]+)/);
            if (match) channelId = match[1];
        }

        await db.query(`
            DELETE FROM youtube_settings;
        `);

        await db.query(`
            INSERT INTO youtube_settings (channel_id, message, ping_everyone, announce_channel)
            VALUES ($1, $2, $3, $4)
        `, [
            channelId,
            message,
            pingEveryone,
            announceChannel.id
        ]);

        await interaction.reply({
            content: `YouTube announcements updated:\n**Channel ID:** ${channelId}\n**Message:** ${message}\n**Ping Everyone:** ${pingEveryone}\n**Announce Channel:** <#${announceChannel.id}>`,
            ephemeral: true
        });
    }
};
