// config/webpack/webpack.config.js
const { generateWebpackConfig, merge } = require('shakapacker');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

function gemRoot(gem) {
  try {
    return execSync(`bundle show ${gem}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim();
  } catch {
    return null;
  }
}

function firstExisting(paths) {
  return paths.find(p => fs.existsSync(p)) || null;
}

const aliases = {};

// ---- blacklight-gallery ----
(() => {
  const root = gemRoot('blacklight-gallery');
  if (!root) return;

  const dirCandidates = [
    path.join(root, 'app/javascript/blacklight-gallery'),
    path.join(root, 'app/javascript/blacklight_gallery'),
  ];
  const dir = firstExisting(dirCandidates);
  if (dir) {
    // allow imports like 'blacklight-gallery/slideshow'
    aliases['blacklight-gallery'] = dir;
    aliases['blacklight_gallery'] = dir; // underscore variant

    // exact-match alias for plain 'blacklight-gallery'
    const indexCandidates = [
      path.join(dir, 'index.js'),
      path.join(dir, 'index.mjs'),
    ];
    const indexFile = firstExisting(indexCandidates);
    if (indexFile) {
      aliases['blacklight-gallery$'] = indexFile;
      aliases['blacklight_gallery$'] = indexFile;
    }
  }
})();

// ---- blacklight-oembed ----
(() => {
  const root = gemRoot('blacklight-oembed');
  if (!root) return;

  function findFirst(root, rels) {
    for (const rel of rels) {
      const p = path.join(root, rel);
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  const target = findFirst(root, [
    // ES-style (rare on 1.x, but try)
    'app/javascript/blacklight-oembed.js',
    'app/javascript/blacklight_oembed.js',
    'app/javascript/blacklight-oembed/index.js',
    'app/javascript/blacklight_oembed/index.js',

    // Legacy Sprockets paths (common)
    'app/assets/javascripts/blacklight/oembed.js',
    'app/assets/javascripts/blacklight-oembed.js',
    'app/assets/javascripts/blacklight_oembed.js',
    'vendor/assets/javascripts/blacklight/oembed.js',
    'vendor/assets/javascripts/blacklight-oembed.js',
    'vendor/assets/javascripts/blacklight_oembed.js',
  ]);

  if (target) {
    // map both forms; add $ for exact-match
    aliases['blacklight-oembed'] = target;
    aliases['blacklight-oembed$'] = target;
    aliases['blacklight_oembed'] = target;
    aliases['blacklight_oembed$'] = target;
    return;
  }

  // LAST-RESORT local shim (see Dockerfile step below)
  const localShim = path.resolve(__dirname, '../../app/javascript/vendor/blacklight-oembed.js');
  if (fs.existsSync(localShim)) {
    aliases['blacklight-oembed'] = localShim;
    aliases['blacklight-oembed$'] = localShim;
    aliases['blacklight_oembed'] = localShim;
    aliases['blacklight_oembed$'] = localShim;
  }
})();

// --- blacklight-spotlight alias for `import 'spotlight'` ---
(() => {
  const root = gemRoot('blacklight-spotlight');
  if (!root) return;

  // Directory so imports like `spotlight/foo` work
  const dir = firstExisting([
    path.join(root, 'app/javascript/spotlight'),
  ]);

  // Exact entry file so bare `import 'spotlight'` works
  const exact = firstExisting([
    path.join(root, 'app/javascript/spotlight.js'),
    path.join(root, 'app/javascript/spotlight/index.js'),
    path.join(root, 'app/javascript/spotlight.esm.js'),
  ]);

  if (dir)  aliases['spotlight'] = dir;
  if (exact) aliases['spotlight$'] = exact;
})();

// Optional: make these importable by name if your packs use them
for (const [alias, gem] of Object.entries({
  'blacklight': 'blacklight',
  'blacklight-spotlight': 'blacklight-spotlight',
})) {
  const root = gemRoot(gem);
  if (!root) continue;
  const dir = path.join(root, 'app/javascript');
  if (fs.existsSync(dir)) aliases[alias] = dir;
}

// If any pack ever imports openseadragon via JS this is optional alias block (safe to keep even if unused)
(() => {
  const root = gemRoot('openseadragon');
  if (!root) return;
  const entry = firstExisting([
    path.join(root, 'app/javascript/openseadragon.js'),
    path.join(root, 'app/javascript/index.js'),
    path.join(root, 'app/javascript/openseadragon.esm.js'),
  ]);
  if (entry) {
    aliases['openseadragon'] = path.join(root, 'app/javascript'); // allow subpaths
    aliases['openseadragon$'] = entry;                              // bare import
  }
})();

// Map ".pkgd" names to the actual files from npm packages
(() => {
  const pick = (...cands) => cands.find(fs.existsSync);

  const img = pick(
    path.resolve(process.cwd(), 'node_modules/imagesloaded/imagesloaded.pkgd.js'),
    path.resolve(process.cwd(), 'node_modules/imagesloaded/imagesloaded.pkgd.min.js'),
  );
  if (img) {
    aliases['imagesloaded.pkgd'] = img; // what blacklight-gallery asks for
    aliases['imagesloaded'] = img; // some code imports the bare name
  }

  const mason = pick(
    path.resolve(process.cwd(), 'node_modules/masonry-layout/dist/masonry.pkgd.js'),
    path.resolve(process.cwd(), 'node_modules/masonry-layout/dist/masonry.pkgd.min.js'),
  );
  if (mason) {
    aliases['masonry.pkgd'] = mason;        // alternate import style
    aliases['masonry-layout'] = mason;        // bare package name
    aliases['masonry.min'] = mason; // what blacklight-gallery imports
    aliases['masonry.pkgd.min'] = mason; // just in case
    aliases['masonry'] = mason; // some code uses thi
  }
})();

// slick (slideshow)
(() => {
  try {
    const slick = require.resolve('slick-carousel/slick/slick.js');
    aliases['slick'] = slick;            // legacy import name
    aliases['slick-carousel'] = slick;   // package name
  } catch {}
})();

const custom = {
  resolve: {
    alias: aliases,
    modules: [
      path.resolve(__dirname, '../../app/javascript'),
      'node_modules',
    ],
    extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx', '.coffee'],
  },
};

module.exports = merge(generateWebpackConfig(), custom);
