import { SlashCommandData } from '@types.js';
import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from 'discord.js';

const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
        content: 'Pong!',
        ephemeral: true,
    });
};

export default {
    type: ApplicationCommandType.ChatInput,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responds if the bot is online.'),
    execute,
} as SlashCommandData;
