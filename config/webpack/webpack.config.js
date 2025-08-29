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
  const target = firstExisting([
    path.join(root, 'app/javascript/blacklight-oembed.js'),
    path.join(root, 'app/javascript/blacklight_oembed.js'),
    path.join(root, 'app/javascript/blacklight-oembed/index.js'),
    path.join(root, 'app/javascript/blacklight_oembed/index.js'),
    path.join(root, 'app/javascript'), // fallback if index.js exists here
  ]);
  if (target) {
    aliases['blacklight-oembed'] = target;
    aliases['blacklight_oembed'] = target;
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
