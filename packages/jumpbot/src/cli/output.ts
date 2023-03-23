import { DiscordAPIError } from 'discord.js';
import { Command } from '@commander-js/extra-typings';
import { warn } from '@utils/logging.js';
import { IBotCredential } from '@types.js';

export const handleDiscordError = (
    command: Command<any>,
    e: DiscordAPIError,
    prefix?: string,
    ignoreErrors?: boolean
) => {
    let jumpbotMessage;
    switch (e.code) {
        case 0:
        case 10012:
        case 40001:
            jumpbotMessage = 'Missing or invalid bot token';
            break;
        case 10004:
            jumpbotMessage = 'Missing or invalid guild id';
            break;
        case 30032:
            jumpbotMessage = 'Too many total application commands';
            break;
        case 30034:
            jumpbotMessage = 'Too many application commands added today';
            break;
        case 10002:
            jumpbotMessage = 'Missing or invalid client/application id';
            break;
        case 50035:
            jumpbotMessage = 'Misformatted commands';
            break;
        default:
            jumpbotMessage = 'Something went wrong';
            break;
    }

    const output = `${prefix ? prefix + ' ' : ''}${jumpbotMessage}.`;

    if (ignoreErrors) {
        warn(output);
    } else {
        command.error(output);
    }
};

export const handleCommandRemovalError = (
    command: Command<any>,
    e: any,
    ignoreErrors?: boolean
) => {
    if (e instanceof DiscordAPIError) {
        return handleDiscordError(
            command,
            e,
            'Command removal failed.',
            ignoreErrors
        );
    } else {
        const genericMessage = `Command removal failed. ${e.message}`;
        if (ignoreErrors) {
            warn(genericMessage);
        } else {
            throw new Error(genericMessage);
        }
    }
};

export const safelyRemoveCommands = async (
    callback: (botCredential: IBotCredential) => Promise<any>,
    botCredential: IBotCredential,
    command: Command<any>,
    options: any
) => {
    try {
        return await callback(botCredential);
    } catch (e) {
        handleCommandRemovalError(command, e, options.ignoreErrors);
    }
};
