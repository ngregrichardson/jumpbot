import { CommandData } from 'dbotjs';
import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
        content: 'Ping!',
        ephemeral: true,
    });
};

export default {
    type: ApplicationCommandType.ChatInput,
    data: new SlashCommandBuilder()
        .setName('pong')
        .setDescription('Responds if the bot is online.'),
    execute,
} as CommandData;
