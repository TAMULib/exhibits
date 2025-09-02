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

  if (dir)  aliases['spotlight']  = dir;
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
