import { buildWebExtension } from '@syarb/web-extension';

import * as Config from './build.config.js';

await buildWebExtension(Config.WEB_EXTENSION_OUT_DIR, Config.VERSION);
