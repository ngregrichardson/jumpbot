import { Client, Guild, REST, Routes } from 'discord.js';
import { CommandData, IBotCredential } from '@types.js';
import {
    failedToDeployCommands,
    failedToParseInDirectory,
    info,
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

const getGuilds = async (botCredential: IBotCredential, client?: Client) => {
    if (client) {
        return client.guilds.fetch().then((guilds) => guilds.map((g) => g));
    } else {
        const rest = getRESTClient(botCredential);
        return (await rest.get(Routes.userGuilds())) as Guild[];
    }
};

export const removeGuildCommands = async (
    botCredential: IBotCredential,
    client?: Client
) => {
    info('Removing guild-specific commands');
    const rest = getRESTClient(botCredential);

    const guilds = await getGuilds(botCredential, client);

    const removalPromises = [];

    for (const guild of guilds) {
        removalPromises.push(
            rest.put(
                Routes.applicationGuildCommands(
                    botCredential.clientId,
                    guild.id
                ),
                { body: [] }
            )
        );
    }

    return Promise.all(removalPromises).catch((e) => {
        throw e;
    });
};

export const removeGlobalCommands = async (botCredential: IBotCredential) => {
    info('Removing global commands');
    const rest = getRESTClient(botCredential);

    return rest.put(Routes.applicationCommands(botCredential.clientId), {
        body: [],
    });
};
