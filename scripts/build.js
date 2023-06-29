console.time('\nTotal build time');

console.time('Cleaning /dist');
const { rmSync } = await import('node:fs');
const Config = await import('./build.config.js');

rmSync(Config.OUT_PATH, { force: true, recursive: true });
console.timeEnd('Cleaning /dist');

console.log('Building...');

console.time('    Core');
await import('@syarb/core/build');
console.timeEnd('    Core');

console.time('    Web Extension');
await import('./build-webextension.js');
console.timeEnd('    Web Extension');

console.time('    Userscript');
await import('./build-userscript.js');
console.timeEnd('    Userscript');

console.timeEnd('\nTotal build time');
