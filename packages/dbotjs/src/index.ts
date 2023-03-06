import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
global.__dbotjsroot = __dirname;

export * from './startup.js';
export * from './types.js';
export * from './commands/utils/deploy.js';
