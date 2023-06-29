import fs from 'node:fs';
import path from 'node:path';

const WEB_EXTENSION_OUT_GECKO_ZIP_NAME = 'extension_gecko.xpi';
const WEB_EXTENSION_OUT_CHROMIUM_ZIP_NAME = 'extension_chromium.zip';

export async function buildWebExtension(outputDirectory, extensionVersion) {
    const { rollup } = await import('rollup');
    const commonjs = (await import('@rollup/plugin-commonjs')).default;
    const nodeResolve = (await import('@rollup/plugin-node-resolve')).default;
    const importAsRaw = (await import('@syarb/rollup-plugin-import-as-raw')).default;

    const { fileURLToPath } = (await import('node:url'));

    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const srcDir = path.join(dirname, '../src');

    const bundle = await rollup({
        input: `${srcDir}/main.js`,
        plugins: [
            nodeResolve(),
            commonjs(),
            importAsRaw(),
        ],
    });

    const code = (await bundle.generate({})).output[0].code;

    await bundle.close();

    // MV3
    {
        const _outputDirectory = `${outputDirectory}/mv3`;
        fs.mkdirSync(_outputDirectory, { recursive: true });
        fs.writeFileSync(`${_outputDirectory}/main.js`, code);
        copyExtensionAssets(srcDir, _outputDirectory, '3', extensionVersion);
        await archiveDirectory(_outputDirectory, `${outputDirectory}/${WEB_EXTENSION_OUT_CHROMIUM_ZIP_NAME}`);
    }

    // MV2
    {
        const _outputDirectory = `${outputDirectory}/mv2`;
        fs.mkdirSync(_outputDirectory, { recursive: true });
        fs.writeFileSync(`${_outputDirectory}/main.js`, code);
        copyExtensionAssets(srcDir, _outputDirectory, '2', extensionVersion);
        await archiveDirectory(_outputDirectory, `${outputDirectory}/${WEB_EXTENSION_OUT_GECKO_ZIP_NAME}`);
    }
}

function copyExtensionAssets(src_dir, dest_dir, manifest_version, app_version) {
    const asset_paths = [
        'background.js',
        'popup/popup.js',
        'popup/multi-page-menu.css',
        'popup/multi-page-menu.js',
        'icons/gray_16.png',
        'icons/gray_48.png',
        'icons/icon_16.png',
        'icons/icon_48.png',
        'icons/icon_128.png',
    ];

    for (const asset_path of asset_paths) {
        const src = `${src_dir}/${asset_path}`;
        const dest = `${dest_dir}/${asset_path}`;

        const dest_asset_dir = path.dirname(dest);

        if (!fs.existsSync(dest_asset_dir)) {
            fs.mkdirSync(dest_asset_dir, { recursive: true });
        }

        fs.copyFileSync(src, dest);
    }

    const replacement_map = [
        ['__version__', app_version],
    ];

    copyAndTransformFile(
        `${src_dir}/popup/popup.html`,
        `${dest_dir}/popup/popup.html`,
        replacement_map,
    );

    copyAndTransformFile(
        `${src_dir}/manifest.mv${manifest_version}.json`,
        `${dest_dir}/manifest.json`,
        replacement_map,
    );
}

function copyAndTransformFile(src, dest, replacementMap) {
    const destDir = path.dirname(dest);

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    let fileContent = fs.readFileSync(src, 'utf-8');

    for (const [pattern, replacement] of replacementMap) {
        fileContent = fileContent.replaceAll(pattern, replacement);
    }

    fs.writeFileSync(dest, fileContent);
}

async function archiveDirectory(src, dest) {
    const archiver = (await import('archiver')).default;
    const archive = archiver('zip', { store: true });
    archive.pipe(fs.createWriteStream(dest));
    archive.directory(src, false);
    await archive.finalize();
}
