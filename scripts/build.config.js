import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(fs.readFileSync(path.join(dirname, '../packages/core/package.json'), 'utf-8'));

export const VERSION = pkg.version;

export const OUT_PATH = 'dist';

export const WEB_EXTENSION_OUT_DIR = `${OUT_PATH}/web-extension`;

export const USERSCRIPT_OUT_DIR = OUT_PATH;
export const USERSCRIPT_OUT_NAME = 'Simple-YouTube-Age-Restriction-Bypass.user.js';
export const USERSCRIPT_HEADER = `
// ==UserScript==
// @name            Simple YouTube Age Restriction Bypass
// @description     Watch age restricted videos on YouTube without login and without age verification 😎
// @description:de  Schaue YouTube Videos mit Altersbeschränkungen ohne Anmeldung und ohne dein Alter zu bestätigen 😎
// @description:fr  Regardez des vidéos YouTube avec des restrictions d'âge sans vous inscrire et sans confirmer votre âge 😎
// @description:it  Guarda i video con restrizioni di età su YouTube senza login e senza verifica dell'età 😎
// @icon            https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass/raw/v2.5.4/src/extension/icon/icon_64.png
// @version         ${VERSION}
// @author          Zerody (https://github.com/zerodytrash)
// @namespace       https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass/
// @supportURL      https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass/issues
// @updateURL       https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass/raw/main/dist/Simple-YouTube-Age-Restriction-Bypass.user.js
// @license         MIT
// @match           https://www.youtube.com/*
// @match           https://www.youtube-nocookie.com/*
// @match           https://m.youtube.com/*
// @match           https://music.youtube.com/*
// @grant           none
// @run-at          document-start
// @compatible      chrome
// @compatible      firefox
// @compatible      opera
// @compatible      edge
// @compatible      safari
// ==/UserScript==

/*
    This is a transpiled version to achieve a clean code base and better browser compatibility.
    You can find the nicely readable source code at https://github.com/zerodytrash/Simple-YouTube-Age-Restriction-Bypass
*/
`;
export const USERSCRIPT_TARGETS = { firefox: '68' };
