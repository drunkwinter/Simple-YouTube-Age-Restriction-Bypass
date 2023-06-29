import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { transformSync } from '@babel/core';

import * as Config from './build.config.js';

const USERSCRIPT_OUT_PATH = `${Config.USERSCRIPT_OUT_DIR}/${Config.USERSCRIPT_OUT_NAME}`;

buildUserscript();

function buildUserscript() {
    // @ts-ignore
    let contents = readFileSync(fileURLToPath(import.meta.resolve('@syarb/core')), 'utf-8');

    // @ts-ignore
    contents = transformSync(contents, {
        presets: ['@babel/preset-env'],
        sourceType: 'script',
        targets: Config.USERSCRIPT_TARGETS,
        retainLines: true,
    })?.code;

    contents = `(function() {${contents}})()`;

    contents = Config.USERSCRIPT_HEADER + contents;

    writeFileSync(USERSCRIPT_OUT_PATH, contents);

    execSync(`dprint fmt ${USERSCRIPT_OUT_PATH} --excludes _`);
}
