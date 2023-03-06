import {
    ApplicationCommandType,
    BitFieldResolvable,
    ChatInputCommandInteraction,
    Client,
    ClientEvents,
    ContextMenuCommandBuilder,
    GatewayIntentsString,
    MessageContextMenuCommandInteraction,
    SlashCommandBuilder,
    UserContextMenuCommandInteraction,
} from 'discord.js';

export interface IBotInitialization {
    credential: IBotCredential;
    intents: BitFieldResolvable<GatewayIntentsString, number>;
    commandsDir?: string;
    eventsDir?: string;
    baseDir?: string;
    testGuildId?: string;
    isProd?: boolean;
}

export interface IBotCredential {
    token: string;
    clientId: string;
}

export interface IFirebaseCredential {
    projectId: string;
    privateKey: string;
    clientEmail: string;
    [key: string]: string;
}

export interface EventData<K extends keyof ClientEvents> {
    name: K | K[];
    execute: (client: Client, ...rest: ClientEvents[K]) => Promise<any>;
    once?: boolean;
}

export interface BaseCommandData {
    type: ApplicationCommandType;
}

export interface SlashCommandData extends BaseCommandData {
    data: SlashCommandBuilder;
    type: ApplicationCommandType.ChatInput;
    execute: (interaction: ChatInputCommandInteraction) => Promise<any>;
}

export interface UserContextMenuCommandData extends BaseCommandData {
    data: ContextMenuCommandBuilder;
    type: ApplicationCommandType.User;
    execute: (interaction: UserContextMenuCommandInteraction) => Promise<any>;
}

export interface MessageContextCommandData extends BaseCommandData {
    data: ContextMenuCommandBuilder;
    type: ApplicationCommandType.Message;
    execute: (
        interaction: MessageContextMenuCommandInteraction
    ) => Promise<any>;
}

export type CommandData =
    | SlashCommandData
    | UserContextMenuCommandData
    | MessageContextCommandData;
