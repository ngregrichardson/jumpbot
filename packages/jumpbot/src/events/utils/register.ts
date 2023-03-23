import { Client } from 'discord.js';
import { parseDirectory } from '@utils/loading.js';
import { EventData } from '@types.js';
import { info } from '@utils/logging.js';

export const registerEvents = async (client: Client, path: string) => {
    const imports = await parseDirectory<EventData<any>>(path);

    for (const { default: event } of imports) {
        const names = Array.isArray(event.name) ? event.name : [event.name];

        names.forEach((name) => {
            client[event.once ? 'once' : 'on'](name, (...args) =>
                event.execute(client, ...args)
            );
        });
    }

    info(`Registered ${imports.length} events`);
};
