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
  const target = firstExisting([
    path.join(root, 'app/javascript/blacklight-gallery.js'),
    path.join(root, 'app/javascript/blacklight_gallery.js'),
    path.join(root, 'app/javascript/blacklight-gallery/index.js'),
    path.join(root, 'app/javascript/blacklight_gallery/index.js'),
    path.join(root, 'app/javascript'), // fallback if index.js exists here
  ]);
  if (target) {
    aliases['blacklight-gallery'] = target;
    aliases['blacklight_gallery'] = target;
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
  const target = firstExisting([
    // common entry locations across Spotlight versions
    path.join(root, 'app/javascript/spotlight.js'),
    path.join(root, 'app/javascript/spotlight/index.js'),
    path.join(root, 'app/javascript/spotlight.esm.js'),
    path.join(root, 'app/javascript/spotlight'), // directory with index.js
    // older fallbacks
    path.join(root, 'app/assets/javascripts/spotlight.js'),
    path.join(root, 'app/javascript') // last-resort if gem ships an index.js there
  ]);
  if (target) {
    aliases['spotlight'] = target;
  }
})();

// Optional: make these importable by name if your packs use them
for (const [alias, gem] of Object.entries({
  'blacklight': 'blacklight',
  'blacklight-spotlight': 'blacklight-spotlight',
  'openseadragon': 'openseadragon',
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
