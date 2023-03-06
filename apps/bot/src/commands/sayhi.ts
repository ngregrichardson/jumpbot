import { CommandData } from 'jumpbot';
import {
    ApplicationCommandType,
    ChannelType,
    ContextMenuCommandBuilder,
    UserContextMenuCommandInteraction,
} from 'discord.js';

const execute = async (interaction: UserContextMenuCommandInteraction) => {
    if (interaction.inGuild()) {
        await interaction.deferReply();
        if (
            interaction.channel &&
            interaction.channel.type === ChannelType.GuildText
        ) {
            await interaction.channel.send({
                content: `Hi ${interaction.targetUser}!`,
            });

            await interaction.deleteReply();
        }
    } else {
        await interaction.reply({
            content: "Can't do that in DMs :(",
        });
    }
};

export default {
    type: ApplicationCommandType.User,
    data: new ContextMenuCommandBuilder().setName('Say Hi'),
    execute,
} as CommandData;
