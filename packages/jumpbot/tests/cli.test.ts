import { expect, test } from 'vitest';
import { exec, ExecException } from 'child_process';
import { resolve, join } from 'path';

import command from '../lib/cli/main.js';

type CommandResponse = {
    code: number;
    error: ExecException | null;
    stdout: string;
    stderr: string;
};

const cli = ({
    cwd = '.',
    args = [],
}: { cwd?: string; args?: string[] } = {}): Promise<CommandResponse> => {
    return new Promise((res) => {
        exec(
            `node ${resolve(
                join(__dirname, '../lib/cli/index.js')
            )} ${args.join(' ')}`,
            {
                cwd,
            },
            (error, stdout, stderr) => {
                res({
                    code: error && error.code ? error.code : 0,
                    error,
                    stdout,
                    stderr,
                });
            }
        );
    });
};

const isHelp = (stderr: string) =>
    expect(stderr).contains(command.helpInformation());

const isDeployHelp = (stderr: string) =>
    expect(stderr).contains(
        command.commands
            .find((c) => c.name() === 'deploy')
            ?.helpInformation({
                error: true,
            })
    );

const isStatus = (code: number, status: number) => expect(code).toBe(status);

const isSuccess = (code: number) => isStatus(code, 0);

const isError = (code: number) => expect(code).not.equal(0);

const isCustomError = (stderr: string, err: string) =>
    expect(stderr).toMatch(new RegExp(`^jumpbot error: ${err}.*`));

const isErrorForTag = (stderr: string, tag: string) =>
    isCustomError(stderr, `.*--${tag}`);

const isErrorForMissingArgument = (stderr: string, argument: string) =>
    isCustomError(stderr, `missing required argument '${argument}'`);

const doesOutputInclude = (stdout: string, match: string) =>
    expect(stdout).contain(match);

const getToken = () => `--token=${process.env.BOT_TOKEN}`;
const getClientId = () => `--client-id=${process.env.CLIENT_ID}`;
const getGuildId = () => `--guild-id=${process.env.TEST_GUILD_ID}`;

test('Empty command', async () => {
    const result = await cli();

    isStatus(result.code, 1);
    isHelp(result.stderr);
});

test('Invalid command', async () => {
    const result = await cli({
        args: ['nope'],
    });

    isStatus(result.code, 1);
    isHelp(result.stderr);
});

test('Missing token', async () => {
    const result = await cli({
        args: ['deploy'],
    });

    isStatus(result.code, 1);
    isDeployHelp(result.stderr);
    isErrorForTag(result.stderr, 'token');
});

test('Missing client-id', async () => {
    const result = await cli({
        args: ['deploy', '--token=123456'],
    });

    isStatus(result.code, 1);
    isDeployHelp(result.stderr);
    isErrorForTag(result.stderr, 'client-id');
});

test('Missing dirs', async () => {
    const result = await cli({
        args: ['deploy', '--token=123456', '--client-id=123456'],
    });

    isStatus(result.code, 1);
    isDeployHelp(result.stderr);
    isErrorForMissingArgument(result.stderr, 'dirs');
});

test('Missing global or guild-id', async () => {
    const result = await cli({
        args: [
            'deploy',
            '--token=123456',
            '--client-id=123456',
            './src/commands',
        ],
    });

    isStatus(result.code, 1);
    isDeployHelp(result.stderr);
    isCustomError(result.stderr, '--guild-id or --global is required');
});

test('Invalid directory', async () => {
    const result = await cli({
        args: [
            'deploy',
            '--token=123456',
            '--client-id=123456',
            '--guild-id=123456',
            './src/blah',
        ],
    });

    isStatus(result.code, 1);
    isDeployHelp(result.stderr);
    isCustomError(result.stderr, '.*is not a valid directory');
});

test('Ignore invalid directory', async () => {
    const result = await cli({
        args: [
            'deploy',
            '--token=123456',
            '--client-id=123456',
            '--guild-id=123456',
            '--ignore-errors',
            './src/blah',
        ],
    });

    isSuccess(result.code);
});

test('Invalid remove type', async () => {
    const result = await cli({
        args: [
            'deploy',
            '--token=123456',
            '--client-id=123456',
            '--guild-id=123456',
            '--remove=blah',
            './src/commands',
        ],
    });

    isStatus(result.code, 1);
    isDeployHelp(result.stderr);
    isCustomError(
        result.stderr,
        "option '-r, --remove <value>' argument '.*' is invalid."
    );
});

test('Ignore remove error', async () => {
    const result = await cli({
        args: [
            'deploy',
            '--token=123456',
            '--client-id=123456',
            '--guild-id=123456',
            '--remove=all',
            '--ignore-errors',
            './src/commands',
        ],
    });

    isSuccess(result.code);
    doesOutputInclude(result.stderr, 'warning: Command removal failed.');
});

test('Remove fails with invalid bot token', async () => {
    const result = await cli({
        args: [
            'deploy',
            '--token=123456',
            '--client-id=123456',
            '--guild-id=123456',
            '--remove=all',
            './src/commands',
        ],
    });

    isError(result.code);
    isDeployHelp(result.stderr);
    doesOutputInclude(
        result.stderr,
        'error: Command removal failed. Missing or invalid bot token'
    );
});

test('Remove fails with invalid client id', async () => {
    const result = await cli({
        args: [
            'deploy',
            getToken(),
            '--client-id=123456',
            '--guild-id=123456',
            '--remove=all',
            './src/commands',
        ],
    });

    isError(result.code);
    isDeployHelp(result.stderr);
    doesOutputInclude(
        result.stderr,
        'error: Command removal failed. Missing or invalid client/application id'
    );
});

test('Guild deployment', async () => {
    const result = await cli({
        args: [
            'deploy',
            getToken(),
            getClientId(),
            getGuildId(),
            './src/commands',
        ],
    });

    isSuccess(result.code);
});

test('Global deployment', async () => {
    const result = await cli({
        args: [
            'deploy',
            '--global',
            getToken(),
            getClientId(),
            './src/commands',
        ],
    });

    isSuccess(result.code);
});
