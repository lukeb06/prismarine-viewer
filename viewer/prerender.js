const path = require('path')
const { makeTextureAtlas } = require('./lib/atlas')
const { prepareBlocksStates } = require('./lib/modelsBuilder')
const mcAssets = require('minecraft-assets')
const fs = require('fs-extra')

const texturesPath = path.resolve(__dirname, '../public/textures')
if (fs.existsSync(texturesPath) && !process.argv.includes('-f')) {
    console.log('textures folder already exists, skipping...')
    process.exit(0)
}
fs.mkdirSync(texturesPath, { recursive: true })

const blockStatesPath = path.resolve(__dirname, '../public/blocksStates')
fs.mkdirSync(blockStatesPath, { recursive: true })

const supportedVersions = require('./lib/version').supportedVersions

for (const version of supportedVersions) {
    console.log('Generating assets/' + version + '.png');
    const assets = mcAssets(version)
    console.log('Generating texture atlas/' + version + '.json');
    const atlas = makeTextureAtlas(assets)

    console.log('Generating createStream/' + version + '.png');
    const out = fs.createWriteStream(path.resolve(texturesPath, version + '.png'))
    console.log('Generating stream/' + version + '.png');
    const stream = atlas.canvas.pngStream()
    console.log('Writing stream/' + version + '.png');
    stream.on('data', (chunk) => out.write(chunk))
    stream.on('end', () => console.log('Generated textures/' + version + '.png'))

    console.log('Generating blocksStates/' + version + '.json');
    if (version == '1.21.1') {
        console.log('here:' + prepareBlocksStates(assets, atlas));
    }
    const blocksStates = JSON.stringify(prepareBlocksStates(assets, atlas))
    console.log('Writing blocksStates/' + version + '.json');
    fs.writeFileSync(path.resolve(blockStatesPath, version + '.json'), blocksStates)

    fs.copySync(assets.directory, path.resolve(texturesPath, version), { overwrite: true })
}
