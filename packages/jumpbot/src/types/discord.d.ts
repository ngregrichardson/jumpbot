import { Collection } from 'discord.js';
import { CommandData } from '@types.js';

declare module 'discord.js' {
    export interface Client {
        commands: Collection<unknown, CommandData>;
    }
}
