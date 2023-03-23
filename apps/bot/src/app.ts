import { GatewayIntentBits } from 'discord.js';
import { startup } from 'jumpbot';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

startup({
    credential: {
        token: process.env.BOT_TOKEN as string,
        clientId: process.env.CLIENT_ID as string,
    },
    intents: [GatewayIntentBits.Guilds],
    baseDir: __dirname,
    commandsDir: './commands',
    eventsDir: './events',
    testGuildId: process.env.TEST_GUILD_ID,
});
