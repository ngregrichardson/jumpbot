import { info } from '@utils/logging.js';
import { Client } from 'discord.js';
import { parseCommands } from './index.js';

export const registerCommands = async (client: Client, path: string) => {
    const commands = await parseCommands(path);

    if (commands.length <= 0) return;

    for (const command of commands) {
        client.commands.set(command.name, command);
    }

    info(`Registered ${commands.length} commands`);
};
