import { EventData } from '@types.js';
import { Client, Events, Interaction } from 'discord.js';

const execute = async (client: Client, interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command || command.type !== interaction.commandType) return;

    try {
        await command.execute(interaction as never);
    } catch (e) {
        console.error(e);

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error executing this command.',
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: 'There was an error executing this command.',
                ephemeral: true,
            });
        }
    }
};

export default {
    name: Events.InteractionCreate,
    execute,
} as EventData<Events.InteractionCreate>;
