const fs = require('fs').promises;
const path = require('path');

async function collectMaps(dir, root) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const maps = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) maps.push(...await collectMaps(full, root));
    else if (e.isFile() && full.endsWith('.map')) maps.push(path.relative(root, full));
  }
  return maps;
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const dist = path.join(projectRoot, 'dist');
  const tmp = path.join(projectRoot, '.tmp_maps');
  try {
    const maps = await collectMaps(dist, dist);
    if (maps.length === 0) return;
    await fs.mkdir(tmp, { recursive: true });
    for (const rel of maps) {
      const src = path.join(dist, rel);
      const dest = path.join(tmp, rel);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.rename(src, dest);
    }
    console.log(`prepack: moved ${maps.length} sourcemap(s) to .tmp_maps`);
  } catch (err) {
    console.error('prepack error:', err);
    process.exitCode = 1;
  }
}

main();
