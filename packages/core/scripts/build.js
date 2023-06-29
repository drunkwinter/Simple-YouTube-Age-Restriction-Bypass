await buildCore();

async function buildCore() {
    const { rollup } = await import('rollup');
    const commonjs = (await import('@rollup/plugin-commonjs')).default;
    const nodeResolve = (await import('@rollup/plugin-node-resolve')).default;
    const importAsRaw = (await import('@syarb/rollup-plugin-import-as-raw')).default;

    const { fileURLToPath } = (await import('node:url'));

    const path = (await import('node:path')).default;

    const dirname = path.dirname(fileURLToPath(import.meta.url));

    const bundle = await rollup({
        input: path.join(dirname, '../src/main.js'),
        plugins: [
            nodeResolve(),
            commonjs(),
            importAsRaw(),
        ],
    });

    await bundle.write({
        dir: path.join(dirname, '../dist'),
    });

    await bundle.close();
}
