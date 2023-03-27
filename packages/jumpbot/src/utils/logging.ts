import chalk, { ChalkInstance } from 'chalk';

const formatJumpbotMessage = (
    message: string,
    prefix?: string,
    color?: ChalkInstance
) =>
    `${(color || chalk.green).bold(
        `jumpbot${prefix ? ` ${prefix}` : ''}`
    )}: ${message}`;

export const info = (message: any) =>
    console.log(formatJumpbotMessage(message));

export const error = (message: any, e?: any, throws = false) => {
    console.error(formatJumpbotMessage(message, 'error', chalk.red));
    if (e) {
        console.error(e);

        if (throws) throw e;
    }
};

export const warn = (message: any) =>
    console.warn(formatJumpbotMessage(message, 'warning', chalk.yellow));

export const failedToParseInDirectory = (
    dir: string,
    type?: string,
    message?: string
) => {
    warn(
        `Failed to parse ${type || 'files'} in ${dir}. ${
            message ? message : 'Are you sure this is a valid directory?'
        }`
    );
};

export const failedToDeployCommands = () => {
    warn(
        `Failed to deploy commands for the reasons below. Make sure that all your commands are properly formatted and do not overlap with jumpbot commands.`
    );
};
