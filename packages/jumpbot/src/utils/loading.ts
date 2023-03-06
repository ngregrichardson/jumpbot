import fs from 'fs';
import { isAbsolute, join } from 'path';
import * as url from 'url';

const getValidDirPath = (path: string) => {
    let fileUrl;

    try {
        fileUrl = new URL(path);
    } catch (e) {
        if (isAbsolute(path)) {
            console.error(e);
            return null;
        } else {
            fileUrl = new URL(join(global.__jumpbotroot, path));
        }
    }

    if (fileUrl.protocol !== 'file:') {
        fileUrl = new URL(url.pathToFileURL(fileUrl.href));
    }

    return fileUrl;
};

export const parseDirectory = async <T>(
    path: string
): Promise<{ default: T }[]> => {
    const imports = [];

    const dir = getValidDirPath(path);

    if (dir === null) {
        throw new Error(
            `Couldn't find directory '${path}'. Are you sure that's a valid directory?`
        );
    }

    const files = fs.readdirSync(dir).filter((file) => file.endsWith('.js'));

    for (const file of files) {
        imports.push(await import(join(dir.href, file)));
    }

    return imports;
};
