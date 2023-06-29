import fs from 'node:fs';

const PREFIX = 'raw:';

async function resolveId(source, importer) {
    if (!source.startsWith(PREFIX)) return;

    const resolvedId = await this.resolve(source.slice(PREFIX.length), importer);

    if (!resolvedId) return;

    return PREFIX + resolvedId.id;
}

function load(id) {
    if (!id.startsWith(PREFIX)) return;

    return 'export default ' + JSON.stringify(fs.readFileSync(id.slice(PREFIX.length), 'utf8'));
}

export default function importAsRaw() {
    return {
        name: 'import-as-raw',
        resolveId,
        load,
    };
}
