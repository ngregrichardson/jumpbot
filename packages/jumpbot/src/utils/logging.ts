import chalk, { ChalkInstance } from 'chalk';

const dbotHeader = (message: string, override?: ChalkInstance) =>
    `${(override || chalk.green).bold('jumpbot')}: ${message}`;

export const info = (message: any) => console.log(dbotHeader(message));

export const error = (message: any, e?: any, throws = false) => {
    console.error(dbotHeader(message, chalk.red));
    if (e) {
        console.error(e);

        if (throws) throw e;
    }
};

export const warn = (message: any) =>
    console.warn(dbotHeader(message, chalk.yellow));

export const failedToParseInDirectory = (dir: string, type?: string) => {
    warn(
        `Failed to parse ${
            type || 'files'
        } in ${dir}. Are you sure this is a valid directory?`
    );
};

export const failedToDeployCommands = () => {
    warn(
        `Failed to deploy commands for the reasons below. Make sure that all your commands are properly formatted and do not overlap with jumpbot commands.`
    );
};
