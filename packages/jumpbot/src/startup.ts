import {
    CommandData,
    IBotInitialization,
    IFirebaseCredential,
} from '@types.js';
import { Client, Collection } from 'discord.js';
import {
    deployGlobalCommands,
    deployGuildCommands,
    removeGuildCommands,
} from '@commands/utils/deploy.js';
import { error, info, warn } from '@utils/logging.js';
import { registerEvents } from '@events/utils/register.js';
import { registerCommands } from '@commands/utils/register.js';
import { join } from 'path';

export const startup = async (
    botInitialization: IBotInitialization,
    firebaseCredential?: IFirebaseCredential
) => {
    if (botInitialization.baseDir) {
        if (botInitialization.eventsDir)
            botInitialization.eventsDir = join(
                botInitialization.baseDir,
                botInitialization.eventsDir
            );
        if (botInitialization.commandsDir)
            botInitialization.commandsDir = join(
                botInitialization.baseDir,
                botInitialization.commandsDir
            );
    }

    // if(firebaseCredential) {
    //
    // }

    info('Initializing jumpbot bot');
    try {
        const client = new Client({
            intents: botInitialization.intents,
        });
        client.commands = new Collection<unknown, CommandData>();

        client.once('ready', async () => {
            const commandDirs = ['./commands'];
            if (botInitialization.commandsDir)
                commandDirs.push(botInitialization.commandsDir);

            if (botInitialization.isProd) {
                await removeGuildCommands(client);

                await deployGlobalCommands(
                    botInitialization.credential,
                    ...commandDirs
                );
            } else {
                if (botInitialization.testGuildId) {
                    await deployGuildCommands(
                        botInitialization.credential,
                        botInitialization.testGuildId,
                        ...commandDirs
                    );
                }
            }

            info('Registering jumpbot events');
            await registerEvents(client, './events');

            if (botInitialization.eventsDir) {
                info('Registering custom events');

                try {
                    await registerEvents(client, botInitialization.eventsDir);
                } catch (e) {
                    warn(
                        `Failed to find events directory '${botInitialization.eventsDir}'. Are you sure this is a valid directory?`
                    );
                }
            }

            info('Registering jumpbot commands');
            await registerCommands(client, './commands');

            if (botInitialization.commandsDir) {
                info('Registering custom commands');
                try {
                    await registerCommands(
                        client,
                        botInitialization.commandsDir
                    );
                } catch (e) {
                    warn(
                        `Failed to find commands directory in '${botInitialization.commandsDir}'. Are you sure this is a valid directory?`
                    );
                }
            }

            info('bot online');
        });

        await client.login(botInitialization.credential.token);

        return client;
    } catch (e) {
        return error(
            'Failed to initialize dbjotjs for the reasons below.',
            e,
            true
        );
    }
};
