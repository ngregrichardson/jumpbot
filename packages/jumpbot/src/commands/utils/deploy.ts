import { Client, REST, Routes } from 'discord.js';
import { CommandData, IBotCredential } from '@types.js';
import {
    failedToDeployCommands,
    failedToParseInDirectory,
    info,
    warn,
} from '@utils/logging.js';
import { parseCommands } from './index.js';

const getRESTClient = (botCredential: IBotCredential) => {
    return new REST({ version: '10' }).setToken(botCredential.token);
};

const RESTifyCommands = (commands: CommandData[]) => {
    return commands.map((command) => command.data.toJSON());
};

const getRESTCommands = async (...paths: string[]) => {
    let commands: any[] = [];

    for (const path of paths) {
        try {
            const parsedCommands = await parseCommands(path);
            commands = [...commands, ...RESTifyCommands(parsedCommands)];
        } catch {
            failedToParseInDirectory(path, 'commands');
        }
    }

    return commands;
};

export const deployGlobalCommands = async (
    botCredential: IBotCredential,
    ...paths: string[]
) => {
    info('Deploying commands globally');
    const commands = await getRESTCommands(...paths);

    if (commands.length <= 0) return;

    const rest = getRESTClient(botCredential);

    try {
        await rest.put(Routes.applicationCommands(botCredential.clientId), {
            body: commands,
        });
        info(`Deployed ${commands.length} commands globally`);
    } catch (e) {
        failedToDeployCommands();
        console.error(e);
    }
};

export const deployGuildCommands = async (
    botCredential: IBotCredential,
    guildId: string,
    ...paths: string[]
) => {
    info(`Deploying commands to guild '${guildId}'`);
    const commands = await getRESTCommands(...paths);

    if (commands.length <= 0) return;

    const rest = getRESTClient(botCredential);

    try {
        await rest.put(
            Routes.applicationGuildCommands(botCredential.clientId, guildId),
            {
                body: commands,
            }
        );
        info(`Deployed ${commands.length} commands to guild '${guildId}'`);
    } catch (e) {
        failedToDeployCommands();
        console.error(e);
    }
};

export const removeGuildCommands = async (client: Client) => {
    info('Removing guild-specific commands');
    return client.guilds
        .fetch()
        .then((guilds) => {
            guilds.forEach((guild) => {
                guild
                    .fetch()
                    .then((g) => g.commands.set([]))
                    .catch(() => {
                        // Ignored
                    });
            });
        })
        .catch(() => {
            warn('Failed to remove existing commands for the reasons below.');
        });
};
