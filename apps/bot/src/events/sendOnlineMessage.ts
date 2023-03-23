import { EventData } from 'jumpbot';
import { Client, Events } from 'discord.js';

const execute = (client: Client, _: Client) => {
    client.guilds.cache.forEach(async (guild) => {
        const owner = await guild.fetchOwner();

        owner.send({
            content: "Hey! I'm back online :)",
        });
    });
};

export default {
    name: Events.ClientReady,
    execute,
} as EventData<Events.ClientReady>;
