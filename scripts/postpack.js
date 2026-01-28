const fs = require('fs').promises;
const path = require('path');

async function collectFiles(dir, root) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...await collectFiles(full, root));
    else if (e.isFile()) files.push(path.relative(root, full));
  }
  return files;
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const dist = path.join(projectRoot, 'dist');
  const tmp = path.join(projectRoot, '.tmp_maps');
  try {
    const exists = await fs.stat(tmp).then(() => true).catch(() => false);
    if (!exists) return;
    const files = await collectFiles(tmp, tmp);
    for (const rel of files) {
      const src = path.join(tmp, rel);
      const dest = path.join(dist, rel);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.rename(src, dest);
    }
    // remove tmp folder
    await fs.rm(tmp, { recursive: true, force: true });
    console.log(`postpack: restored ${files.length} sourcemap(s) from .tmp_maps`);
  } catch (err) {
    console.error('postpack error:', err);
    process.exitCode = 1;
  }
}

main();
