import {
    createCommand,
    createOption,
    OutputConfiguration,
} from '@commander-js/extra-typings';
import { version } from '../../package.json';
import { dirname, isAbsolute, join } from 'path';
import { existsSync, lstatSync } from 'fs';
import {
    deployGlobalCommands,
    deployGuildCommands,
    removeGlobalCommands,
    removeGuildCommands,
} from '@commands/utils/deploy.js';
import { IBotCredential } from '@types.js';
import { handleDiscordError, safelyRemoveCommands } from '@cli/output.js';
import { error, warn } from '@utils/logging.js';
import { DiscordAPIError } from 'discord.js';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

enum RemovalType {
    NONE = 'none',
    GUILD = 'guild',
    GLOBAL = 'global',
    ALL = 'all',
}

const program = createCommand('jumpbot')
    .description('A CLI to manage jumpbot Discord bots')
    .version(version)
    .addHelpCommand()
    .showHelpAfterError(true)
    .showSuggestionAfterError(true);

const globalOption = createOption(
    '-g, --global',
    'deploys commands globally (ignores --guild-id)'
)
    .preset(true)
    .default(false)
    .env('JUMP_GLOBAL')
    .implies({
        guildId: null,
    });

const guildIdOption = createOption(
    '--guild-id <id>',
    'id of the guild to deploy to (when not using --global)'
)
    .preset(null)
    .default(null)
    .env('JUMP_GUILD_ID');

const removeOption = createOption(
    '-r, --remove <value>',
    'if/how to remove existing commands'
)
    .choices(Object.values(RemovalType))
    .preset(null)
    .default(RemovalType.NONE)
    .env('JUMP_REMOVE');

const ignoreErrorsOption = createOption(
    '--ignore-errors',
    'ignores errors like invalid directories'
)
    .preset(true)
    .default(false)
    .env('JUMP_IGNORE_ERRORS');

const botTokenOption = createOption(
    '-t, --token <token>',
    'discord bot token for authentication'
)
    .preset(null)
    .env('JUMP_BOT_TOKEN')
    .makeOptionMandatory();

const clientIdOption = createOption(
    '-c, --client-id <id>',
    'discord application/client id for authentication'
)
    .preset(null)
    .env('JUMP_CLIENT_ID')
    .makeOptionMandatory();

const deployCommand = createCommand('deploy')
    .description('Deploys slash and context menu commands to Discord')
    .arguments('<dirs...>')
    .addOption(globalOption)
    .addOption(guildIdOption)
    .addOption(removeOption)
    .addOption(ignoreErrorsOption)
    .addOption(botTokenOption)
    .addOption(clientIdOption)
    .addHelpCommand()
    .showHelpAfterError(true)
    .showSuggestionAfterError(true)
    .action(async (dirs, options) => {
        if (!options.guildId && !options.global) {
            deployCommand.error('--guild-id or --global is required');
            return;
        }

        const botCredential: IBotCredential = {
            token: options.token,
            clientId: options.clientId,
        };

        dirs = dirs.map((dir) =>
            isAbsolute(dir) ? dir : join(process.cwd(), dir)
        );

        const validDirectories: string[] = [join(__dirname, '../commands')];

        for (const dir of dirs) {
            const exists = existsSync(dir);
            if (exists) {
                const stats = lstatSync(dir);
                if (stats.isDirectory()) {
                    validDirectories.push(dir);
                    continue;
                }
            }

            if (!options.ignoreErrors) {
                deployCommand.error(`'${dir}' is not a valid directory`);
            }
        }

        switch (options.remove) {
            case RemovalType.GUILD:
                await safelyRemoveCommands(
                    removeGuildCommands,
                    botCredential,
                    deployCommand,
                    options
                );
                break;
            case RemovalType.GLOBAL:
                await safelyRemoveCommands(
                    removeGlobalCommands,
                    botCredential,
                    deployCommand,
                    options
                );
                break;
            case RemovalType.ALL:
                await safelyRemoveCommands(
                    removeGuildCommands,
                    botCredential,
                    deployCommand,
                    options
                );

                await safelyRemoveCommands(
                    removeGlobalCommands,
                    botCredential,
                    deployCommand,
                    options
                );
                break;
        }

        try {
            if (options.global) {
                await deployGlobalCommands(botCredential, ...validDirectories);
            } else {
                await deployGuildCommands(
                    botCredential,
                    options.guildId!,
                    ...validDirectories
                );
            }
        } catch (e: any) {
            if (e instanceof DiscordAPIError) {
                return handleDiscordError(
                    deployCommand,
                    e,
                    'Command deployment failed.',
                    options.ignoreErrors
                );
            } else {
                const genericMessage = `Command deployment failed. ${e.message}`;
                if (options.ignoreErrors) {
                    warn(genericMessage);
                } else {
                    throw new Error(genericMessage);
                }
            }
        }
    });

const outputConfig: OutputConfiguration = {
    outputError: (str: string) => error(str.replace('error: ', '')),
};

program.configureOutput(outputConfig);

deployCommand.configureOutput(outputConfig);

program.addCommand(deployCommand);

export default program;
