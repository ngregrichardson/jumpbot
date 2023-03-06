import { CommandData } from 'dbotjs';
import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
} from 'discord.js';

const execute = async (interaction: MessageContextMenuCommandInteraction) => {
    await interaction.targetMessage.reply({
        content: 'Woah!',
    });

    await interaction.deferReply();
    await interaction.deleteReply();
};

export default {
    type: ApplicationCommandType.Message,
    data: new ContextMenuCommandBuilder().setName('Say Woah'),
    execute,
} as CommandData;
