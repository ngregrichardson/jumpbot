import { parseDirectory } from '@utils/loading.js';
import { CommandData } from '@types.js';
import { ApplicationCommandType } from 'discord.js';

export const parseCommands = async (path: string) => {
    const imports = await parseDirectory<CommandData>(path);

    return imports.map(({ default: file }) => {
        if (file.type !== ApplicationCommandType.ChatInput) {
            file.data = file.data.setType(file.type);
        }

        return {
            name: file.data.name,
            ...file,
        };
    });
};
